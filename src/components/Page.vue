<template>
  <v-app id="inspire">
    <v-toolbar color="blue lighten-1" dark fixed app>
      <v-toolbar-title>Drone employee</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <v-flex md6 offset-md3>
            <Info />
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer color="blue lighten-1" app></v-footer>
  </v-app>
</template>

<script>
import Info from './Info'

export default {
  name: 'Page',
  components: {
    Info
  }
}
</script>
