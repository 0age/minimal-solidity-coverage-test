pragma solidity ^0.4.24;

contract MinimalCoverageTest {
  function covered() external pure returns (string) {
    return "nice!";
  }

  function uncovered() external pure returns (string) {
  	return "uh-oh!";
  }
}