<template>
	<div
		class="flex justify-center items-center border-2 border-amber-500 rounded-3xl profileUser"
	>
		<div class="h-56 w-72 absolute flex justify-center items-center">
			<img
				v-if="store.user.photoURL"
				class="object-cover h-28 w-28 rounded-full border-2 border-black"
				:src="store.user.photoURL"
				alt="profile"
			/>
			<img
				v-else
				class="object-cover h-28 w-28 rounded-full border-2 border-black"
				src="../../assets/images/poker-king-beard-logo-design-260nw-2168601229.webp"
				alt="profile"
			/>
		</div>

		<div class="h-56 mx-4 w-5/6 rounded-3xl shadow-md sm:w-80 sm:mx-0">
			<div class="h-1/2 w-full flex justify-between items-baseline px-3 py-5">
				<h1 class="text-black text-xl font-bold">Profile</h1>
				<button
					@click="openCoinStore"
					class="z-50 flex mt-2 mr-4 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</button>
			</div>

			<div
				class="h-1/2 w-full rounded-3xl flex flex-col justify-around items-center"
			>
				<div class="w-full h-1/2 flex justify-between items-center px-3 pt-2">
					<div class="flex flex-col justify-center items-center">
						<img
							src="../../assets/images/depositphotos_11531027-stock-illustration-poker-chip.png"
							alt="Chips"
							class="h-12 w-12"
						/>
						<h1 class="text-black text-2xl">{{ userChips }}</h1>
					</div>
					<div class="ml-2 flex flex-col justify-center items-center">
						<button
							@click="logOut"
							class="z-50 text-sm items-center p-2 bg-black text-white rounded-2xl hover:bg-gray-800 focus:outline-none"
						>
							<img
								src="../../assets/images/cerrar-sesion2.png"
								alt="Google logo"
								class="inline-block w-6 h-6"
							/>
							Log out
						</button>
					</div>
				</div>

				<div class="w-full h-1/2 flex flex-col justify-center items-center">
					<h1 class="text-gray-700 font-bold">{{ store.user.displayName }}</h1>
				</div>
			</div>
		</div>
	</div>
</template>

<!--<button @click="openCoinStore" class="flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>-->

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import { ref, watchEffect } from "vue";
import { onValue, auth, refDB } from "../../utils/firebase";

const store = useUserStore();
const router = useRouter();
const userChips = ref(0);

const logOut = async () => {
	try {
		await store.doLogout();
		console.log("desconectado");
		router.push("/");
	} catch (error) {
		console.log(error.message);
	}
};

const openCoinStore = () => {
	console.log("abriendo coin store");
	window.open("/coin-store", "_blank", "width=500,height=500");
};

watchEffect(async () => {
	if (store.user) {
		const userRef = await refDB("users/" + auth.currentUser.uid + "/chips", 0);
		onValue(userRef, (snapshot) => {
			userChips.value = snapshot.val();
		});
	}
});
</script>

<style scoped>
.profileUser {
	background-image: url("../../assets/images/palos.jpg");
	background-size: cover;
	background-position: center;
}
</style>
