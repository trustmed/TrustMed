#!/bin/bash
# Automates the creation and joining of the TrustMed channel

export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trustmed.com/orderers/orderer.trustmed.com/tls/ca.crt

echo "================================================="
echo "1. Creating TrustMed Channel..."
echo "================================================="
peer channel create -o orderer.trustmed.com:7050 -c trustmedchannel -f ./channel-artifacts/trustmedchannel.tx --tls --cafile $ORDERER_CA

echo "================================================="
echo "2. Joining Hospital Peer to the channel..."
echo "================================================="
# Defaults to Hospital Admin based on docker-compose CLI config
peer channel join -b trustmedchannel.block

echo "================================================="
echo "3. Joining Insurance Peer to the channel..."
echo "================================================="
export CORE_PEER_LOCALMSPID="InsuranceMSP"
export CORE_PEER_ADDRESS=peer0.insurance.trustmed.com:9051
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/insurance.trustmed.com/users/Admin@insurance.trustmed.com/msp

peer channel join -b trustmedchannel.block

echo "================================================="
echo "✅ TrustMed Channel Successfully Forged!"
echo "================================================="
