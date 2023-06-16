<!-- eslint-disable max-len -->
<template>
  <button
    :class="color"
    style="
      -webkit-box-shadow: 0px 10px 13px -7px #000000, 5px 5px 15px 8px rgba(0, 0, 0, 0);
      box-shadow: 0px 10px 13px -7px #000000, 5px 5px 15px 5px rgba(0, 0, 0, 0);
    "
  >
    <span class="font-bold"> {{ text }}</span>
  </button>
</template>

<script setup>

defineProps({
  text: String,
  color: String,
});

</script>
