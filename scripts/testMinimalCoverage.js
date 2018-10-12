var Web3 = require('web3')
var assert = require('assert')

const CoverageTestData = require('../build/contracts/MinimalCoverageTest.json')

web3 = new Web3('ws://localhost:8555')

async function test() {
  let passed = 0
  let failed = 0
  console.log('\n ***** running tests *****')

  const latestBlock = await web3.eth.getBlock('latest')
  const gasLimit = latestBlock.gasLimit

  const addresses = await Promise.resolve(web3.eth.getAccounts())
  if (addresses.length < 1) {
    console.log('cannot find enough addresses to run tests...')
    return false
  }
  const address = addresses[0]

  const CoverageTestDeployer = new web3.eth.Contract(CoverageTestData.abi)

  let deployGas = await web3.eth.estimateGas({
      from: address,
      data: CoverageTestDeployer.deploy({
        data: CoverageTestData.bytecode
      }).encodeABI()
  })

  if (deployGas > gasLimit) {
    console.error('deployment costs exceed block gas limit')
    process.exit(1)
  }

  const CoverageTest = await CoverageTestDeployer.deploy({
    data: CoverageTestData.bytecode
  }).send({
    from: address,
    gas: gasLimit - 1,
    gasPrice: 10 ** 1
  }).catch(error => {
    console.log(
      ' ✘ contract deploys successfully'
    )
    process.exit(1)
  })

  console.log(
    ' ✓ contract deploys successfully'
  )
  passed++

  await CoverageTest.methods.covered().call({
    from: address,
    gas: gasLimit - 1,
    gasPrice: 10 ** 1    
  }).then(value => {
    assert.strictEqual(value, 'nice!')
    console.log(
      ' ✓ `covered()` returns the expected value'
    )
    passed++
  }).catch(error => {
    console.log(
      ' ✘ `covered()` returns the expected value'
    )
    failed++ 
  })

  console.log(
    `completed ${passed + failed} test${passed + failed === 1 ? '' : 's'} ` + 
    `with ${failed} failure${failed === 1 ? '' : 's'}.`
  )

  if (failed > 0) {
    process.exit(1)
  }

  process.exit(0)

}

test()
