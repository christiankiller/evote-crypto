export {}
import { EccElGamalZKP, Proof } from '../../src/index'

const { assert } = require('chai')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

// fixed constants for values 1 -> generator and 0 -> generator^-1
const yesVoteOnCurve = ec.curve.g
const noVoteOnCurve = ec.curve.g.neg()

describe('EccElGamal Zero Knowledge Proofs', () => {
  it('Points that encode the plaintexts should lie on the curve', function() {
    assert(ec.curve.validate(noVoteOnCurve) && ec.curve.validate(yesVoteOnCurve))
  })

  xit('Should generate a valid proof for a vote', () => {
    const keyPair = ec.genKeyPair()
    const privateKey = keyPair.getPrivate()
    const publicKey = keyPair.getPublic()

    const proof: Proof = EccElGamalZKP.createZKP(yesVoteOnCurve, publicKey)

    // TODO: verifyZKP is not finished -> something wrong with the challenge (hash)
    const result: boolean = EccElGamalZKP.verifyZKP(proof, publicKey)
    assert(result)
  })
})
