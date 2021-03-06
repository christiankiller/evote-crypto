import { expect } from 'chai'
import { GlobalHelper, FFelGamal } from '../../src/index'

describe('Finite Field ElGamal Encryption', () => {
  it('should encode a message', () => {
    const sp = FFelGamal.SystemSetup.generateSystemParameters(11, 3)

    const values = [
      { decoded: 0, encoded: 1 },
      { decoded: 1, encoded: 3 },
      { decoded: 2, encoded: 9 },
      { decoded: 3, encoded: 5 },
      { decoded: 4, encoded: 4 },
      { decoded: 5, encoded: 1 },
      { decoded: 6, encoded: 3 },
      { decoded: 7, encoded: 9 },
      { decoded: 8, encoded: 5 },
      { decoded: 9, encoded: 4 },
      { decoded: 10, encoded: 1 },
      { decoded: 11, encoded: 3 },
    ]

    for (const value of values) {
      expect(FFelGamal.Encryption.encodeMessage(value.decoded, sp).toNumber()).to.equal(
        value.encoded
      )
    }
  })

  it('should decode an encoded message', () => {
    const sp = FFelGamal.SystemSetup.generateSystemParameters(11, 3)

    const values = [
      { decoded: 0, encoded: 1 },
      { decoded: 1, encoded: 3 },
      { decoded: 2, encoded: 9 },
      { decoded: 3, encoded: 5 },
      { decoded: 4, encoded: 4 },
      // TODO: define constraints for message space
      /*{ decoded: 5, encoded: 1 },
      { decoded: 6, encoded: 3 },
      { decoded: 7, encoded: 9 },
      { decoded: 8, encoded: 5 },
      { decoded: 9, encoded: 4 },
      { decoded: 10, encoded: 1 },
      { decoded: 11, encoded: 3 },*/
    ]

    for (const value of values) {
      expect(FFelGamal.Encryption.decodeMessage(value.encoded, sp).toNumber()).to.equal(
        value.decoded
      )
    }
  })

  it('compare decryption implementations', () => {
    const log = false
    const [sp, { h: pk, sk }] = FFelGamal.SystemSetup.generateSystemParametersAndKeys(1319, 2)

    for (let i = 0; i < 10; i++) {
      // generate random messages of max size 10
      const message = GlobalHelper.getSecureRandomValue(GlobalHelper.newBN(10, 10))

      log && console.log(i)
      log && console.log('prime      (p)\t', sp.p)
      log && console.log('generator  (g)\t', sp.g)
      log && console.log('dec secret (x)\t', sk)
      log && console.log('           (h)\t', pk)
      log && console.log('plaintext    (m)', message)
      log && console.log('------------------------')

      const mEnc = FFelGamal.Encryption.encrypt(message, sp, pk, log)
      const mD1 = FFelGamal.Encryption.decrypt1(mEnc, sk, sp, log)
      const mD2 = FFelGamal.Encryption.decrypt2(mEnc, sk, sp, log)

      expect(mD1.eq(message)).to.be.true
      expect(mD2.eq(message)).to.be.true
      expect(mD1.eq(mD2)).to.be.true
    }
  })

  it('homomorphic addition', () => {
    const log = false
    const [sp, { h: pk, sk }] = FFelGamal.SystemSetup.generateSystemParametersAndKeys(1319, 2)

    for (let i = 0; i < 10; i++) {
      // generate random messages of max size 10
      const m1 = GlobalHelper.getSecureRandomValue(GlobalHelper.newBN(10, 10))
      const m2 = GlobalHelper.getSecureRandomValue(GlobalHelper.newBN(10, 10))

      const eM1 = FFelGamal.Encryption.encrypt(m1, sp, pk, log)
      const eM2 = FFelGamal.Encryption.encrypt(m2, sp, pk, log)

      const dSum = FFelGamal.Encryption.decrypt1(
        FFelGamal.Encryption.add(eM1, eM2, sp),
        sk,
        sp,
        log
      )

      expect(dSum.eq(m1.add(m2))).to.be.true
    }
  })
})
