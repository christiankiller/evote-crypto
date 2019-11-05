export {}
import { ElGamal, ELGamalZKP } from '../../src/index'

const random = require('random')
const { expect } = require('chai')

describe('ElGamal ZKP Proof', () => {
  it('create and verify proof', () => {
    const uniqueID = '0xAd4E7D8f03904b175a1F8AE0D88154f329ac9329'

    // generate and verify 10 proofs (with different random variables)
    const test = (p: number, g: number) => {
      for (let i = 0; i < 10; i++) {
        const prnt = false
        prnt && console.log('p:', p, ', g:', g)
        let pk
        try {
          pk = ElGamal.generateKeysZKP(p, g)[0]
        } catch (error) {
          console.error(error)
          break
        }

        // yes vote
        prnt && console.log('yes proof')
        const yesVote = 1
        const yesEnc = ElGamal.encrypt(yesVote, pk, prnt)
        const yesProof = ELGamalZKP.generateYesProof(yesEnc, pk, uniqueID)

        const verifiedYesProof = ELGamalZKP.verifyProof(yesEnc, yesProof, pk, uniqueID)
        expect(verifiedYesProof).to.be.true

        // no vote
        prnt && console.log('no proof')
        const noVote = 0
        const noEnc = ElGamal.encrypt(noVote, pk, prnt)
        const noProof = ELGamalZKP.generateNoProof(noEnc, pk, uniqueID)

        const verifiedNoProof = ELGamalZKP.verifyProof(noEnc, noProof, pk, uniqueID)
        expect(verifiedNoProof).to.be.true
      }
    }

    //  7 => 2
    test(7, 2)

    // 11 => 3
    test(11, 3)

    // 23 => 2, 6, 8
    test(23, 2)
    test(23, 6)
    test(23, 8)

    // TODO: adjust test cases below

    // 47 => 2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 32, 36
    test(47, 2)
    test(47, 3)
    test(47, 4)
    test(47, 6)
    test(47, 8)
    test(47, 9)
    test(47, 12)
    test(47, 16)
    test(47, 18)
    test(47, 24)
    test(47, 32)
    test(47, 36)

    // 59 => 3, 4, 12, 16, 48
    test(59, 3)
    test(59, 4)
    test(59, 12)
    test(59, 16)
    test(59, 48)

    // 83 => 4, 16, 64
    test(83, 4)
    test(83, 16)
    test(83, 64)
  })
})
