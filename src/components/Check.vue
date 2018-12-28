<template>
  <div>
    <v-container grid-list-md>
      <v-layout justify-center row wrap>
        <v-flex sm12 md10 lg6>
          <v-card>
            <v-card-title primary-title>
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex md9>
                    <h3 class="headline mb-0">Check registration</h3>
                  </v-flex>
                  <v-flex md3 class="text-xs-right">
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
                        v-model="id_serial"
                        :rules="requireRule"
                        label="Serial number of the aircraft"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="liability"
                        :rules="requireRule"
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
      id_serial: '',
      requireRule: [
        v => !!v || 'Field required'
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
        this.loadingCheck = true
        const liability = new Liability(robonomics.web3, this.liability, this.liability)
        liability.getInfo()
          .then((r) => {
            if (r.result !== '') {
              const regex = new RegExp(this.id_serial)
              ipfsBagCat(r.result, { topics: ['/agent/result/id_serial'] }, (bag) => {
                this.submit = true
                this.loadingCheck = false
                if (bag.data.match(regex)) {
                  this.isCheck = true
                }
              })
            } else {
              this.submit = true
              this.loadingCheck = false
              this.isCheck = false
            }
          })
      }
    }
  }
}
</script>
