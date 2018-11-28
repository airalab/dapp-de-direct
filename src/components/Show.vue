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
                    <h3 class="headline mb-0">Show</h3>
                  </v-flex>
                  <v-flex md2 class="text-xs-right">
                    <v-btn to="/" color="info">
                      Registration
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md12>
                    <h2>liability</h2>
                    <a :href="`https://etherscan.io/address/${address}`" target="_blank">{{ address }}</a><br />
                    lighthouse: <a :href="`https://etherscan.io/address/${liability.lighthouse}`" target="_blank">{{ liability.lighthouse }}</a><br />
                    model: <a :href="`https://ipfs.io/ipfs/${liability.model}`" target="_blank">{{ liability.model }}</a><br />
                    objective: <a :href="`https://ipfs.io/ipfs/${liability.objective}`" target="_blank">{{ liability.objective }}</a><br />
                    promisee: <a :href="`https://etherscan.io/address/${liability.promisee}`" target="_blank">{{ liability.promisee }}</a><br />
                    promisor: <a :href="`https://etherscan.io/address/${liability.promisor}`" target="_blank">{{ liability.promisor }}</a><br />
                    token: <a :href="`https://etherscan.io/address/${liability.token}`" target="_blank">{{ liability.token }}</a><br />
                    cost: {{liability.cost}}<br /><br />

                    <h3>Result:</h3>
                    <div v-if="liability.result != ''">
                      <a :href="`https://ipfs.io/ipfs/${liability.result}`" target="_blank">{{ liability.result }}</a><br />
                      <span v-for="(res, resIndex) in liability.resultMessage" :key="resIndex">
                        {{ res }}<br />
                      </span>
                    </div>
                    <div v-else>
                      No result
                    </div>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { Liability } from 'robonomics-js'
import getRobonomics from '../utils/robonomics'
import ipfsBagCat from '../utils/ipfs'

let robonomics

export default {
  name: 'Show',
  props: ['address'],
  data () {
    return {
      liability: {
        cost: 0,
        lighthouse: '',
        model: '',
        objective: '',
        promisee: '',
        promisor: '',
        result: '',
        token: '',
        resultMessage: []
      }
    }
  },
  created () {
    robonomics = getRobonomics()
    robonomics.ready().then(() => {
      const liability = new Liability(robonomics.web3, this.address, this.address)
      liability.getInfo()
        .then((r) => {
          this.liability = {
            cost: r.cost,
            lighthouse: r.lighthouse,
            model: r.model,
            objective: r.objective,
            promisee: r.promisee,
            promisor: r.promisor,
            result: r.result,
            token: r.token,
            resultMessage: []
          }
          if (this.liability.result !== '') {
            ipfsBagCat(r.result, {}, (bag) => {
              this.liability.resultMessage.push(bag.data)
            })
          }
        })
    })
  }
}
</script>
