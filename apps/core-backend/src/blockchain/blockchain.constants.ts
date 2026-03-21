import path from 'node:path';

const testNetworkPath =
  '/run/media/cyb.x/8720ec57-e420-4992-9f53-678accf912c9/Journey/IIT/SDGP/TrustMed/blockchain/fabric-samples/test-network';

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
