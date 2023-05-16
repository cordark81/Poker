import { db } from "../utils/firebase";

const state = {
  messages: [],
  messagesListener: () => {},
};

const getters = {};

const mutations = {
  setMessages(state, messages) {
    state.messages = messages;
  },
  setMessagesListener(state, listener) {
    if (listener) {
      state.listener = listener;
    } else {
      state.messagesListener();
    }
  },
};

const actions = {
  async getMessages({ commit }, roomID) {
    const query = db
            .collection("Rooms")
            .doc(roomID)
            .collection("messages")
            .orderBy("createdAt","desc")
            .onSnapShot(doSnapShot);

    commit("setMessagesListener", query)

    function doSnapShot (querySnapshot){
        const messages = []
        
        querySnapshot.forEach(doc => {
            let message = doc.data();
            message.id = doc.id;
            messages.unshift(message);
        });

        commit("setMessages", messages)
    }
  },

  async createMessage ({ rootState }, {roomID,message }){
    await db.collection("Rooms").doc(roomID).collection("messages").add({
      userId : rootState.user.user.uid,
      userName : rootState.user.user.displayName,
      message,
      createdAt: Date.now()
    })
  }
 
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
