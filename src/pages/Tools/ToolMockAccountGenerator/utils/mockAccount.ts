interface IMockAccountSamples {
  names: readonly string[];
  remarks: readonly string[];
}

// 生成定长数字串，保留开头的零。
function randomDigits(length: number) {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, '0');
}

// 使用占位号码和示例域名，生成明显虚构的注册资料。
export function generateMockAccount(samples: IMockAccountSamples) {
  const serial = randomDigits(8);
  const name = samples.names[Math.floor(Math.random() * samples.names.length)];
  const remarks =
    samples.remarks[Math.floor(Math.random() * samples.remarks.length)];

  return {
    account: `Mock${serial}`,
    name: `${name}${serial.slice(-4)}`,
    mobile: `000${randomDigits(8)}`,
    officePhone: `0000-${randomDigits(8)}`,
    fax: `0000-${randomDigits(8)}`,
    email: `mock${serial}@example.com`,
    remarks,
  };
}
