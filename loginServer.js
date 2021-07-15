const fsPromises = require('fs/promises')
const path = require('path')
const express = require('express')
const { ethers } = require('ethers')
const { wiki } = require('./wiki')

const LOG_FILE = 'logs/access-log.txt'

const IP_LOOPBACK = 'localhost'
const IP_LOCAL = '192.168.0.10' // my local ip on my network
const PORT = 3333