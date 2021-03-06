/**
 * Key Generation Proof
 *
 * ElGamal Finite Field Non-Interactive Zero-Knowledge Proof for Key Generation
 * Using the Schnorr Proof
 *
 * Proof that one has knowledge of the private key x to the public key h=g^x.
 * Proof of knowledge of a discrete logarithm of x = log_g(g^x)
 *
 * - generate and verify proofs
 */

import BN = require('bn.js')
import { GlobalHelper } from '../../index'
import { KeyPair, SystemParameters, isKeyPair, isSystemParameters } from '../index'
import { KeyGenerationProof } from './index'

const web3 = require('web3')
const log = false

const generateChallenge = (q: BN, uniqueID: string, h_: BN, b: BN): BN => {
  let c = web3.utils.soliditySha3(uniqueID, h_, b)
  c = web3.utils.toBN(c)
  c = c.mod(q)
  return c
}

// 1. generate a "second" key pair (a,b) = (random value from Z_q, g^a mod p)
// 2. compute challenge
// 3. compute d = a + c*sk
export const generate = (
  params: SystemParameters,
  keyPair: KeyPair, // share
  id: string
): KeyGenerationProof => {
  isSystemParameters(params)
  isKeyPair(keyPair)

  const { p, q, g } = params
  const { h, sk } = keyPair

  const a: BN = GlobalHelper.getSecureRandomValue(q)
  const b: BN = GlobalHelper.powBN(g, a, p) // commitment

  const c: BN = generateChallenge(q, id, h, b) // challenge
  const d: BN = GlobalHelper.addBN(a, GlobalHelper.mulBN(c, sk, q), q) // response

  return { c, d }
}

// 1. recompute b = g^d/h^c
// 2. recompute the challenge c
// 3. verify that the challenge is correct
// 4. verify that: g^d == b * h^c
export const verify = (
  params: SystemParameters,
  proof: KeyGenerationProof,
  h: BN,
  id: string
): boolean => {
  isSystemParameters(params)

  const { p, q, g } = params
  const { c, d } = proof

  const b: BN = GlobalHelper.divBN(GlobalHelper.powBN(g, d, p), GlobalHelper.powBN(h, c, p), p)

  const c_: BN = generateChallenge(q, id, h, b)
  const hashCheck: boolean = GlobalHelper.timingSafeEqualBN(c, c_)

  const gPowD: BN = GlobalHelper.powBN(g, d, p)
  const bhPowC: BN = GlobalHelper.mulBN(b, GlobalHelper.powBN(h, c, p), p)
  const dCheck: boolean = GlobalHelper.timingSafeEqualBN(gPowD, bhPowC)

  log && console.log('do the hashes match?\t', hashCheck)
  log && console.log('g^d == b * h^c?\t', dCheck)
  log && console.log()

  return hashCheck && dCheck
}
