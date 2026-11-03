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

// 生成演示资料，手机号采用中国大陆格式，邮箱使用示例域名。
export function generateMockAccount(samples: IMockAccountSamples) {
  const serial = randomDigits(8);
  const name = samples.names[Math.floor(Math.random() * samples.names.length)];
  const remarks =
    samples.remarks[Math.floor(Math.random() * samples.remarks.length)];

  return {
    account: `Mock${serial}`,
    name,
    mobile: `1${Math.floor(Math.random() * 7) + 3}${randomDigits(9)}`,
    officePhone: `0000-${randomDigits(8)}`,
    fax: `0000-${randomDigits(8)}`,
    email: `mock${serial}@example.com`,
    remarks,
  };
}
