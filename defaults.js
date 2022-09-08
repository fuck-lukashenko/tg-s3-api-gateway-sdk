import SilentLogger from './SilentLogger.js';

const defaults = {
  botTestMode: false,
  botToken: '5647502518:AAGrCLcvCjMKh-eqBfdQFRFdfSRq7q5rO40',
  channelId: '@sfoivsnedfndaljsf',
  logger: SilentLogger,
  serverPublicKeyJWK: {
    alg: 'RSA-OAEP-256',
    e: 'AQAB',
    ext: true,
    key_ops: ['encrypt'],
    kty: 'RSA',
    n: '36kxK8vMqymZoYdZ54xG6YeVsGdVRhSrwIYGd8I1i4_6SaT0AyjwGz4jCZNGn9QTzRN6uM0An_OF46axSnT-ZEQ3VUTz5-Jkzgy0uhSQqUiXsW0xEBoLTPl8tObskMNgvxzCKVihQaeP8ATinpcH-R_RTJzblUHdRadtEYLUb8FyB0dcVFr6VI1sw_regVv9GgLoBZqdgFVrCwflnpdxrRPHcy5meSKqiO2tNZ8x-zyMSGnCCq7_BwK1eQw7o_I64gwLNZK41VO2RXBbTU-F8neLX9laXKkGxbYwVPTPWqv5bUbKKre9fvpbtrFlCv7Ynwm6sRywMemrK6fj0zOeUngDEThtzUUApqrXqW810yUmtlZF72sUHdkgC15c6NtKuQ6vkoLSkHR_Eru0Q5kJyi5uAF6xMRJUK-MxrZMb6gTDF7_y_7FA6-CBoURhh2uZ9qMIvScRsIAwzMF1iWIPF903h7WyEwBcLFT5Di5eow_CPnS9v3oeA0oC7toBc6vIUR826gnt0zEDkYrZEjaQE0XgZNpqPCoH_mDCh7imHacnU5abvfdArUMNNCUgMRp2RXcclvY-idymHdLn_8otRhYmRgPadbqvLLTiZuEhjFNhx9qSI9pOo9GZOMgrsrc4iFFYaeVTo9IMo6OmZdeDeuM45w1GE4-An3Myvf4d-5E',
  },
  serverVerificationKeyJWK: {
    crv: 'P-256',
    ext: true,
    key_ops: ['verify'],
    kty: 'EC',
    x: 'qEV4OiMfA7eUorUFW175TpmJQT5VkMn6HmYpHdQG95Y',
    y: 'fxA2zXE28BIpqrRSfuqpssfo7qjpP3hcn1soKX9d604',
  },
};

export default defaults;
