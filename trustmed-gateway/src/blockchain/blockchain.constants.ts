import * as path from 'path';

const testNetworkPath =
  '/home/ubuntu/TrustMed/blockchain/fabric-samples/fabric-samples/test-network';

export const FABRIC = {
  channelName: 'mychannel',
  chaincodeName: 'trustmed',
  mspId: 'Org1MSP',

  certPath: path.join(
    testNetworkPath,
    'organizations',
    'peerOrganizations',
    'org1.example.com',
    'users',
    'Admin@org1.example.com',
    'msp',
    'signcerts',
    'cert.pem',
  ),

  keyDirPath: path.join(
    testNetworkPath,
    'organizations',
    'peerOrganizations',
    'org1.example.com',
    'users',
    'Admin@org1.example.com',
    'msp',
    'keystore',
  ),

  tlsCertPath: path.join(
    testNetworkPath,
    'organizations',
    'peerOrganizations',
    'org1.example.com',
    'peers',
    'peer0.org1.example.com',
    'tls',
    'ca.crt',
  ),

  peerEndpoint: 'localhost:7051',
  peerHostAlias: 'peer0.org1.example.com',
};
