<template>
  <div>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex md12>
          <v-card>
            <v-card-title primary-title>
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md10>
                    <h3 class="headline mb-0">Drone registration</h3>
                  </v-flex>
                  <v-flex md2 class="text-xs-right">
                    <v-btn to="check" color="warning">
                      Check
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md12>
                    <RegForm ref="regForm" />
                  </v-flex>
                </v-layout>
              </v-container>
              <v-divider />
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md12>
                    <div>
                      Cost: {{price.valueStr}} |
                      Balance: {{balance.valueStr}} |
                      Approved: {{approveTrade.valueStr}}
                    </div>
                  </v-flex>
                </v-layout>
              </v-container>

              <v-btn
                v-if="approveTrade.value < price.value"
                :loading="loadingApprove"
                :disabled="loadingApprove || balance.value < price.value"
                color="warning"
                @click.native="sendApproveTrade"
              >
                Approve
              </v-btn>
              <v-btn
                v-if="approveTrade.value >= price.value"
                :loading="loadingOrder"
                :disabled="loadingOrder || balance.value < price.value || !$refs.regForm.valid"
                color="warning"
                @click.native="order"
              >
                Order
              </v-btn>
            </v-card-text>
          </v-card>
        </v-flex>

        <v-flex md12>
          <v-card v-if="liability">
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">Result</h3>
              </div>
            </v-card-title>
            <v-card-text>
              <Liability :liability="liability" />
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios'
import { Token } from 'robonomics-js'
import getRobonomics from '../utils/robonomics'
import { formatDecimals, watchTx } from '../utils/utils'
import ipfsBagCat from '../utils/ipfs'
import Liability from './Liability'
import RegForm from './RegForm'
import * as config from '../config'

let robonomics

export default {
  name: 'info',
  components: {
    Liability,
    RegForm
  },
  data () {
    return {
      token: null,
      price: {
        value: config.PRICE,
        valueStr: `${config.PRICE} ${config.TOKEN_SYMBOL}`
      },
      loadingApprove: false,
      loadingOrder: false,
      balance: {
        value: 0,
        valueStr: `0 ${config.TOKEN_SYMBOL}`
      },
      approveTrade: {
        value: 0,
        valueStr: `0 ${config.TOKEN_SYMBOL}`,
        show: true,
        disabled: true,
        text: 'Approve'
      },
      market: config.MARKET_MODEL,
      lighthouseName: config.LIGHTHOUSE,
      liability: null
    }
  },
  created () {
    robonomics = getRobonomics()
    robonomics.ready().then(() => {
      this.token = new Token(robonomics.web3, config.TOKEN)
      robonomics.setLighthouse(this.lighthouseName)
        .then(() => this.fetchData())
        .then(() => {
          console.log('xrt', robonomics.xrt.address)
          console.log('factory', robonomics.factory.address)
          console.log('lighthouse', robonomics.lighthouse.address)
          robonomics.getDemand(this.market, (msg) => {
            console.log('demand', msg)
            // emulator kfc
            // return this.emulatorKfc(msg)
          })
          robonomics.getOffer(this.market, (msg) => {
            console.log('offer', msg)
          })
          robonomics.getResult((msg) => {
            console.log('result unverified', msg)
            if (this.liability !== null && msg.liability === this.liability.address) {
              this.setResult(msg.result, false)
            }
          })
        })
    })
  },
  methods: {
    emulatorKfc (demand) {
      let liability
      const offer = {
        objective: demand.objective,
        token: demand.token,
        cost: demand.cost,
        validator: demand.validator,
        lighthouse: demand.lighthouse,
        lighthouseFee: 0,
        deadline: demand.deadline
      }
      return robonomics.postOffer(this.market, offer)
        .then((r) => {
          liability = r
          console.log('liability offer', liability.address)
          return this.getResult(liability.address)
        })
        .then((r) => robonomics.postResult({ liability: liability.address, success: true, result: r }))
        .then(() => {
          console.log('result send msg')
        })
    },
    fetchData () {
      return this.token.call('balanceOf', [robonomics.account])
        .then((balanceOf) => {
          this.balance.value = balanceOf
          this.balance.valueStr = `${formatDecimals(balanceOf, 0)} ${config.TOKEN_SYMBOL}`
          if (balanceOf > 0) {
            return this.token.call('allowance', [robonomics.account, robonomics.factory.address])
          }
          return false
        })
        .then((allowance) => {
          if (allowance) {
            this.approveTrade.value = allowance
            this.approveTrade.valueStr = `${formatDecimals(allowance, 0)} ${config.TOKEN_SYMBOL}`
            if (allowance <= 0) {
              this.approveTrade.disabled = false
              this.approveTrade.text = 'Approve'
            } else {
              this.approveTrade.disabled = true
              this.approveTrade.text = 'Approved'
            }
          }
        })
    },
    sendApproveTrade () {
      this.loadingApprove = true
      return this.token.send('approve', [robonomics.factory.address, this.price.value * 100], { from: robonomics.account })
        .then((r) => {
          this.approveTrade.disabled = true
          this.approveTrade.text = '...'
          return watchTx(r)
        })
        .then(() => {
          this.loadingApprove = false
          this.approveTrade.text = 'Approved'
          return this.fetchData()
        })
        .catch(() => {
          this.loadingApprove = false
        })
    },
    getResult (address) {
      const payload = {
        address,
        id_serial: this.$refs.regForm.id_serial,
        email: this.$refs.regForm.email,
        drone_type: this.$refs.regForm.drone_type,
        drone_make: this.$refs.regForm.drone_make,
        drone_model: this.$refs.regForm.drone_model,
        id_reg: this.$refs.regForm.id_reg,
        pilot_name: this.$refs.regForm.pilot_name,
        pilot_reg: this.$refs.regForm.pilot_reg
      }
      return axios.post('http://localhost:3004/get_result', JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((r) => {
          if (r.data.objective) {
            return r.data.objective
          }
          return false
        })
    },
    getObjective () {
      const payload = {
        id_serial: this.$refs.regForm.id_serial,
        email: this.$refs.regForm.email,
        drone_type: this.$refs.regForm.drone_type,
        drone_make: this.$refs.regForm.drone_make,
        drone_model: this.$refs.regForm.drone_model,
        id_reg: this.$refs.regForm.id_reg,
        pilot_name: this.$refs.regForm.pilot_name,
        pilot_reg: this.$refs.regForm.pilot_reg
      }
      // console.log(payload)
      // return Promise.resolve('QmQU8UuWAHQev3BYSYirk6shgZrBGEq87DTyxDVYvsywtt')
      return axios.post(config.URL_GET_OBJECTIVE, JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((r) => {
          if (r.data.objective) {
            // console.log(r.data.objective)
            // ipfsBagCat(r.data.objective, {}, (bag) => {
            //   console.log(bag.data)
            // })
            return r.data.objective
          }
          return false
        })
    },
    setResult (result, check = true) {
      this.liability = {
        ...this.liability,
        result,
        check
      }
      if (this.liability.resultMessage.length === 0) {
        this.liability.resultMessage.push('')
        ipfsBagCat(result, {}, (bag) => {
          this.liability.resultMessage.push(bag.data)
        })
      }
    },
    newLiability (liability) {
      console.log('liability demand', liability.address)
      return liability.getInfo()
        .then((info) => {
          this.liability = {
            address: liability.address,
            worker: liability.worker,
            ...info,
            resultMessage: []
          }
          liability.watchResult((result) => {
            console.log('result', result)
            this.setResult(result, true)
          })
          return true
        })
        .catch((e) => {
          console.log(e)
          setTimeout(() => {
            this.newLiability(liability)
          }, 2000)
        })
    },
    order () {
      if (this.$refs.regForm.$refs.form.validate() && this.price.value > 0) {
        this.liability = null
        this.loadingOrder = true
        return this.getObjective()
          .then((objective) => {
            web3.eth.getBlock('latest', (e, r) => {
              const demand = {
                objective,
                token: this.token.address,
                cost: this.price.value,
                lighthouse: robonomics.lighthouse.address,
                validator: '0x0000000000000000000000000000000000000000',
                validatorFee: 0,
                deadline: r.number + 1000
              }
              robonomics.postDemand(this.market, demand)
                .then((liability) => this.newLiability(liability))
                .then(() => {
                  this.loadingOrder = false
                })
                .catch((e) => {
                  this.loadingOrder = false
                })
            })
          })
          .catch((e) => {
            this.loadingOrder = false
          })
      }
      return false
    }
  }
}
</script>
