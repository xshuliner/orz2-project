#!/usr/bin/env bash

set -euo pipefail

# Change these defaults in one place before copying this standalone script to
# the server. Environment variables can override them for one-off runs.
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_HOST="${DEPLOY_HOST:-43.167.247.143}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/orz2.online/html}"
PROTECTED_ENTRIES="${PROTECTED_ENTRIES:-portal,gengjian1203}"
SSH_HOST_KEY_DIR="${SSH_HOST_KEY_DIR:-/etc/ssh}"
KEY_COMMENT="github-actions:orz2-project"
HELPER_PATH="${HELPER_PATH:-/usr/local/sbin/orz2-deploy-root-site}"
HELPER_CONFIG_PATH="${HELPER_CONFIG_PATH:-/etc/orz2-deploy-root-site.conf}"
SUDOERS_PATH="${SUDOERS_PATH:-/etc/sudoers.d/orz2-deploy-root-site}"
STATE_DIR="${STATE_DIR:-/var/lib/orz2-deploy-root-site}"

fail() {
  printf 'Setup error: %s\n' "$*" >&2
  exit 1
}

require_root() {
  [[ "$(id -u)" == "0" ]] || fail "run this script as root"
}

validate_inputs() {
  local protected_entry
  local protected_entries=()

  [[ "${DEPLOY_USER}" =~ ^[A-Za-z0-9._-]+$ ]] || fail "invalid DEPLOY_USER"
  [[ "${DEPLOY_HOST}" =~ ^[A-Za-z0-9.-]+$ ]] || fail "invalid DEPLOY_HOST"
  [[ "${DEPLOY_PORT}" =~ ^[0-9]+$ ]] || fail "invalid DEPLOY_PORT"
  ((DEPLOY_PORT >= 1 && DEPLOY_PORT <= 65535)) || fail "DEPLOY_PORT is out of range"
  [[ "${DEPLOY_ROOT}" == /* && "${DEPLOY_ROOT}" != "/" ]] || fail "DEPLOY_ROOT must be an absolute non-root path"
  [[ "${DEPLOY_ROOT}" != *".."* && "${DEPLOY_ROOT}" != *"//"* ]] || fail "DEPLOY_ROOT contains an unsafe path segment"
  [[ "${SSH_HOST_KEY_DIR}" == /* ]] || fail "SSH_HOST_KEY_DIR must be an absolute path"
  [[ "${HELPER_PATH}" == /* && "${HELPER_CONFIG_PATH}" == /* && "${SUDOERS_PATH}" == /* ]] || fail "helper paths must be absolute"
  [[ "${STATE_DIR}" == /* && "${STATE_DIR}" != "/" ]] || fail "STATE_DIR must be an absolute non-root path"

  IFS=',' read -r -a protected_entries <<< "${PROTECTED_ENTRIES}"
  ((${#protected_entries[@]} > 0)) || fail "PROTECTED_ENTRIES must not be empty"
  for protected_entry in "${protected_entries[@]}"; do
    [[ "${protected_entry}" =~ ^[A-Za-z0-9._-]+$ ]] || fail "invalid protected entry: ${protected_entry}"
    [[ "${protected_entry}" != .* ]] || fail "protected entry must not be hidden: ${protected_entry}"
  done
}

initialize_temp_dir() {
  TMP_DIR="$(mktemp -d /tmp/orz2-deploy-setup.XXXXXX)"
  trap 'rm -rf "${TMP_DIR}"' EXIT
}

install_required_packages() {
  local packages=()

  command -v rsync >/dev/null 2>&1 || packages+=(rsync)
  if ! command -v sudo >/dev/null 2>&1 || ! command -v visudo >/dev/null 2>&1; then
    packages+=(sudo)
  fi
  ((${#packages[@]} == 0)) && return

  if command -v dnf >/dev/null 2>&1; then
    dnf install -y "${packages[@]}"
  elif command -v yum >/dev/null 2>&1; then
    yum install -y "${packages[@]}"
  else
    fail "install these packages first: ${packages[*]}"
  fi
}

ensure_deploy_user() {
  if ! id "${DEPLOY_USER}" >/dev/null 2>&1; then
    useradd -m -s /bin/bash "${DEPLOY_USER}"
  fi
}

install_root_site_helper() {
  mkdir -p "${DEPLOY_ROOT}"

  cat >"${TMP_DIR}/orz2-deploy-root-site" <<'HELPER'
#!/usr/bin/env bash

set -euo pipefail

source "__HELPER_CONFIG_PATH__"

STATE_FILE="${STATE_DIR}/managed-entries"
IFS=',' read -r -a PROTECTED_ENTRIES <<< "${PROTECTED_ENTRIES_CSV}"
NEW_ENTRIES=()
OLD_ENTRIES=()
RELEASE_DIR=""
BACKUP_DIR=""
STAGING_ROOT=""
ROLLBACK_NEEDED=0

fail() {
  printf 'Deploy helper error: %s\n' "$*" >&2
  exit 1
}

is_protected_entry() {
  local entry="$1"
  local protected

  for protected in "${PROTECTED_ENTRIES[@]}"; do
    [[ "${entry}" == "${protected}" ]] && return 0
  done
  return 1
}

validate_entry() {
  local entry="$1"

  [[ -n "${entry}" ]] || fail "top-level entry must not be empty"
  [[ "${entry}" != .* ]] || fail "hidden top-level entries are not allowed: ${entry}"
  [[ "${entry}" =~ ^[A-Za-z0-9._-]+$ ]] || fail "unsupported top-level entry: ${entry}"
  ! is_protected_entry "${entry}" || fail "protected top-level entry is not deployable: ${entry}"
}

cleanup() {
  local status="$?"
  local entry

  trap - EXIT

  if ((ROLLBACK_NEEDED == 1)); then
    for entry in "${NEW_ENTRIES[@]}"; do
      rm -rf -- "${DEPLOY_ROOT:?}/${entry}"
    done

    if [[ -d "${BACKUP_DIR}" ]]; then
      while IFS= read -r -d '' entry; do
        mv -- "${entry}" "${DEPLOY_ROOT}/"
      done < <(find "${BACKUP_DIR}" -mindepth 1 -maxdepth 1 -print0)
    fi
  fi

  [[ -n "${RELEASE_DIR}" ]] && rm -rf -- "${RELEASE_DIR}"
  [[ -n "${BACKUP_DIR}" ]] && rm -rf -- "${BACKUP_DIR}"
  [[ -n "${STAGING_ROOT}" ]] && rm -rf -- "${STAGING_ROOT}"

  exit "${status}"
}

trap cleanup EXIT

[[ "$(id -u)" == "0" ]] || fail "helper must run as root"
[[ "${DEPLOY_ROOT}" == /* && "${DEPLOY_ROOT}" != "/" ]] || fail "unsafe deploy root"

if [[ "${1:-}" == "--print-protected-entries" ]]; then
  printf '%s\n' "${PROTECTED_ENTRIES_CSV}"
  exit 0
fi
if [[ "${1:-}" == "--print-deploy-root" ]]; then
  printf '%s\n' "${DEPLOY_ROOT}"
  exit 0
fi
[[ "$#" == "0" ]] || fail "unsupported argument"

deploy_home="$(getent passwd "${DEPLOY_USER}" | cut -d: -f6)"
[[ -n "${deploy_home}" ]] || fail "could not determine deploy user home"
STAGING_ROOT="${deploy_home}/.orz2-deploy-stage"

[[ -d "${STAGING_ROOT}" && ! -L "${STAGING_ROOT}" ]] || fail "staging directory is missing or unsafe"
[[ "$(cd "${STAGING_ROOT}" && pwd -P)" == "${STAGING_ROOT}" ]] || fail "staging directory must not contain symlinks"
staging_owner="$(stat -c %U "${STAGING_ROOT}" 2>/dev/null || stat -f %Su "${STAGING_ROOT}")"
[[ "${staging_owner}" == "${DEPLOY_USER}" ]] || fail "staging directory has an unexpected owner"
if [[ -n "$(find "${STAGING_ROOT}" -type l -print)" ]]; then
  fail "artifact must not contain symbolic links"
fi

shopt -s dotglob nullglob
for entry_path in "${STAGING_ROOT}"/*; do
  NEW_ENTRIES+=("${entry_path##*/}")
done
((${#NEW_ENTRIES[@]} > 0)) || fail "artifact does not contain any top-level entries"

for entry in "${NEW_ENTRIES[@]}"; do
  validate_entry "${entry}"
done

if [[ -f "${STATE_FILE}" ]]; then
  while IFS= read -r entry || [[ -n "${entry}" ]]; do
    OLD_ENTRIES+=("${entry}")
  done <"${STATE_FILE}"
  for entry in "${OLD_ENTRIES[@]-}"; do
    [[ -n "${entry}" ]] || continue
    validate_entry "${entry}"
  done
fi

mkdir -p "${DEPLOY_ROOT}" "${STATE_DIR}"
RELEASE_DIR="$(mktemp -d "${DEPLOY_ROOT}/.orz2-release.XXXXXX")"
BACKUP_DIR="$(mktemp -d "${DEPLOY_ROOT}/.orz2-backup.XXXXXX")"
cp -a -- "${STAGING_ROOT}/." "${RELEASE_DIR}/"
chmod -R a+rX "${RELEASE_DIR}"

ROLLBACK_NEEDED=1
for entry in "${OLD_ENTRIES[@]-}"; do
  [[ -n "${entry}" ]] || continue
  if [[ -e "${DEPLOY_ROOT}/${entry}" || -L "${DEPLOY_ROOT}/${entry}" ]]; then
    mv -- "${DEPLOY_ROOT}/${entry}" "${BACKUP_DIR}/"
  fi
done
for entry in "${NEW_ENTRIES[@]}"; do
  if [[ -e "${DEPLOY_ROOT}/${entry}" || -L "${DEPLOY_ROOT}/${entry}" ]]; then
    mv -- "${DEPLOY_ROOT}/${entry}" "${BACKUP_DIR}/"
  fi
done

for entry in "${NEW_ENTRIES[@]}"; do
  [[ "${entry}" == "index.html" ]] && continue
  mv -- "${RELEASE_DIR}/${entry}" "${DEPLOY_ROOT}/"
done
if [[ -e "${RELEASE_DIR}/index.html" ]]; then
  mv -- "${RELEASE_DIR}/index.html" "${DEPLOY_ROOT}/"
fi

state_tmp="$(mktemp "${STATE_DIR}/managed-entries.XXXXXX")"
printf '%s\n' "${NEW_ENTRIES[@]}" >"${state_tmp}"
mv -- "${state_tmp}" "${STATE_FILE}"

ROLLBACK_NEEDED=0
printf 'Root site deployment complete: %s\n' "${DEPLOY_ROOT}"
HELPER

  sed "s#__HELPER_CONFIG_PATH__#${HELPER_CONFIG_PATH}#" "${TMP_DIR}/orz2-deploy-root-site" >"${TMP_DIR}/orz2-deploy-root-site.rendered"
  printf 'DEPLOY_USER=%q\nDEPLOY_ROOT=%q\nSTATE_DIR=%q\nPROTECTED_ENTRIES_CSV=%q\n' "${DEPLOY_USER}" "${DEPLOY_ROOT}" "${STATE_DIR}" "${PROTECTED_ENTRIES}" >"${TMP_DIR}/orz2-deploy-root-site.conf"
  printf '%s ALL=(root) NOPASSWD: %s\n' "${DEPLOY_USER}" "${HELPER_PATH}" >"${TMP_DIR}/orz2-deploy-root-site.sudoers"

  install -m 755 -o root -g root "${TMP_DIR}/orz2-deploy-root-site.rendered" "${HELPER_PATH}"
  install -m 644 -o root -g root "${TMP_DIR}/orz2-deploy-root-site.conf" "${HELPER_CONFIG_PATH}"
  install -m 440 -o root -g root "${TMP_DIR}/orz2-deploy-root-site.sudoers" "${SUDOERS_PATH}"
  visudo -cf "${SUDOERS_PATH}" >/dev/null
}

generate_ci_key() {
  local deploy_group deploy_home authorized_keys authorized_keys_tmp

  deploy_group="$(id -gn "${DEPLOY_USER}")"
  deploy_home="$(getent passwd "${DEPLOY_USER}" | cut -d: -f6)"
  [[ -n "${deploy_home}" ]] || fail "could not determine home directory for ${DEPLOY_USER}"

  ssh-keygen -q -t ed25519 -N "" -C "${KEY_COMMENT}" -f "${TMP_DIR}/deploy_key"

  install -d -m 700 -o "${DEPLOY_USER}" -g "${deploy_group}" "${deploy_home}/.ssh"
  authorized_keys="${deploy_home}/.ssh/authorized_keys"
  authorized_keys_tmp="${TMP_DIR}/authorized_keys"

  if [[ -f "${authorized_keys}" ]]; then
    grep -vF " ${KEY_COMMENT}" "${authorized_keys}" >"${authorized_keys_tmp}" || true
  else
    : >"${authorized_keys_tmp}"
  fi

  cat "${TMP_DIR}/deploy_key.pub" >>"${authorized_keys_tmp}"
  install -m 600 -o "${DEPLOY_USER}" -g "${deploy_group}" "${authorized_keys_tmp}" "${authorized_keys}"
}

print_github_values() {
  local host_key
  local host_keys=()

  shopt -s nullglob
  host_keys=("${SSH_HOST_KEY_DIR}"/ssh_host_*_key.pub)
  ((${#host_keys[@]} > 0)) || fail "no SSH host public keys were found"

  printf '\n'
  printf 'GitHub Actions configuration\n'
  printf '============================\n'
  printf 'Required GitHub values: 7. Optional GitHub values: none.\n'
  printf 'Copy every value below into GitHub: Settings -> Secrets and variables -> Actions\n'
  printf 'The private key is printed once and removed from the server when this script exits.\n'
  printf '\n'
  printf '===== [REQUIRED] Repository variable: DEPLOY_SSH_USER =====\n'
  printf '%s\n' "${DEPLOY_USER}"
  printf '===== End: DEPLOY_SSH_USER =====\n'
  printf '\n'
  printf '===== [REQUIRED] Repository variable: DEPLOY_SSH_HOST =====\n'
  printf '%s\n' "${DEPLOY_HOST}"
  printf '===== End: DEPLOY_SSH_HOST =====\n'
  printf '\n'
  printf '===== [REQUIRED] Repository variable: DEPLOY_SSH_PORT =====\n'
  printf '%s\n' "${DEPLOY_PORT}"
  printf '===== End: DEPLOY_SSH_PORT =====\n'
  printf '\n'
  printf '===== [REQUIRED] Repository variable: DEPLOY_ROOT =====\n'
  printf '%s\n' "${DEPLOY_ROOT}"
  printf '===== End: DEPLOY_ROOT =====\n'
  printf '\n'
  printf '===== [REQUIRED] Repository variable: DEPLOY_PROTECTED_ENTRIES =====\n'
  printf '%s\n' "${PROTECTED_ENTRIES}"
  printf '===== End: DEPLOY_PROTECTED_ENTRIES =====\n'
  printf '\n'
  printf '===== [REQUIRED] Repository secret: DEPLOY_SSH_PRIVATE_KEY =====\n'
  cat "${TMP_DIR}/deploy_key"
  printf '===== End: DEPLOY_SSH_PRIVATE_KEY =====\n'
  printf '\n'
  printf '===== [REQUIRED] Repository secret: DEPLOY_SSH_KNOWN_HOSTS =====\n'
  for host_key in "${host_keys[@]}"; do
    awk -v host="${DEPLOY_HOST}" -v port="${DEPLOY_PORT}" 'NF >= 2 { endpoint = port == "22" ? host : "[" host "]:" port; print endpoint " " $1 " " $2 }' "${host_key}"
  done
  printf '===== End: DEPLOY_SSH_KNOWN_HOSTS =====\n'
  printf '\n'
  printf 'Optional GitHub values: none.\n'
  printf 'Setup complete. Re-running this script safely rotates the GitHub Actions deployment key.\n'
}

require_root
validate_inputs
initialize_temp_dir
install_required_packages
ensure_deploy_user
install_root_site_helper
generate_ci_key
print_github_values
