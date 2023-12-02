//import './assets/main.css'

import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faFloppyDisk,
  faMagnifyingGlass,
  faPenToSquare,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

library.add(faPenToSquare, faTrash, far, faMagnifyingGlass, faFloppyDisk)
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)

app.mount('#app')
