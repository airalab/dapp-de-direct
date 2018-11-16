<template>
  <div>
    <v-form ref="form" v-model="valid">
      <v-text-field
        v-model="id_serial"
        :rules="requireRule"
        label="Serial number of the aircraft"
        hint="Example: INTCJ123-4567-890"
        required
      ></v-text-field>
      <v-text-field
        v-model="email"
        :rules="emailRules"
        label="Operator's contact email"
        required
      ></v-text-field>
      <v-text-field
        v-model="drone_type"
        label="Generic type of drone"
        hint="Example: [vtol, fixed_wing, multirotor, hybrid]"
      ></v-text-field>
      <v-text-field
        v-model="drone_make"
        label="Manufacturer of vehicle"
        hint="Example: DJI"
      ></v-text-field>
      <v-text-field
        v-model="drone_model"
        label="Model of vehicle"
        hint="Example: Matrice 100"
      ></v-text-field>
      <v-text-field
        v-model="id_reg"
        label="Country/State registration number of the aircraft"
        hint="Example: FA123456789"
      ></v-text-field>
      <v-text-field
        v-model="pilot_name"
        label="Operator's full name"
        hint="Example: John Smith"
      ></v-text-field>
      <v-text-field
        v-model="pilot_reg"
        label="Coutry/State pilot ID"
        hint="Example: CERT-4567"
      ></v-text-field>

      <v-checkbox
        v-model="checkbox"
        :rules="[v => !!v || 'You must agree to continue!']"
        required
      >
        <div slot="label">
          You agree to our
          <a href="static/ToS_-_Decentralized_Technology_(draft).doc" target="_blank">Terms of service</a>
          and
          <a href="static/Privacy_Policy_Decentralized_Technology_v.3_(draft).docx" target="_blank">Privacy Policy</a>
        </div>
      </v-checkbox>
    </v-form>
  </div>
</template>

<script>
export default {
  name: 'regForm',
  data () {
    return {
      valid: false,

      id_serial: '',
      email: '',
      drone_type: '',
      drone_make: '',
      drone_model: '',
      id_reg: '',
      pilot_name: '',
      pilot_reg: '',

      checkbox: false,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
      ],
      requireRule: [
        v => !!v || 'Field required'
      ]
    }
  }
}
</script>
