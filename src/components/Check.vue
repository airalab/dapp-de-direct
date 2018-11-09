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
                    <h3 class="headline mb-0">Check</h3>
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
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <v-text-field
                        v-model="idDrone"
                        :rules="idDroneRules"
                        label="ID drone"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="liability"
                        :rules="liabilityRules"
                        label="Liability address"
                        required
                      ></v-text-field>
                    </v-form>
                  </v-flex>
                </v-layout>
              </v-container>
              <v-divider />
              <v-btn
                :loading="loadingCheck"
                :disabled="loadingCheck || !valid"
                color="primary"
                @click.native="check"
              >
                Check
              </v-btn>
              <v-icon v-if="submit && isCheck === true" large color="green darken-2">mdi-check</v-icon>
              <v-icon v-if="submit && isCheck === false" large color="red darken-2">mdi-close</v-icon>
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
  name: 'Check',
  data () {
    return {
      submit: false,
      isCheck: false,
      loadingCheck: false,
      valid: false,
      liability: '',
      idDrone: '',
      liabilityRules: [
        v => !!v || 'Address liability is required'
      ],
      idDroneRules: [
        v => !!v || 'Id drone is required'
      ]
    }
  },
  created () {
    robonomics = getRobonomics()
    robonomics.ready().then(() => {
      console.log('start')
    })
  },
  methods: {
    check () {
      if (this.$refs.form.validate()) {
        const liability = new Liability(robonomics.web3, this.liability, this.liability)
        liability.getInfo()
          .then((r) => {
            this.submit = true
            const regex = new RegExp(this.idDrone)
            ipfsBagCat(r.result, { topics: ['/agent/result/droneid'] }, (bag) => {
              if (bag.data.match(regex)) {
                this.isCheck = true
              }
            })
          })
      }
    }
  }
}
</script>
