<template>
    <div>
      <transition enter-active-class="ease-out duration-300" enter-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200" leave-class="opacity-100" leave-to-class="opacity-0">
        <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
  
          <div class="background-img fixed inset-0 z-10 overflow-y-auto flex items-center justify-center">
            <transition enter-active-class="ease-out duration-300"
              enter-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to-class="opacity-100 translate-y-0 sm:scale-100"
              leave-active-class="ease-in duration-200" leave-class="opacity-100 translate-y-0 sm:scale-100"
              leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <div
                 class="bg-black relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-5/6 p-5 sm:max-w-lg border-2 border-amber-400">
                <div class="mx-10 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="w-full text-center">
                      <div>
                        <!-- Zona para introducir el formulario -->
                        <FormCreateUser @closeModal="closeModal" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition>
    </div>
  </template>
  

<script setup>

import FormCreateUser from './FormCreateUser.vue';
import {defineEmits} from 'vue'

const emits = defineEmits(["closeModal"])

const closeModal = () => {
    emits("closeModal")
}

</script>

<style  scoped>
.background-img {
  background-image: url("../../assets/images/palos.jpg");
  background-size: cover;
  background-position: center;
}

</style>