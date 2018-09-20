import axios from '~/plugins/axios';

import findIndex from 'lodash/findIndex';
import random from 'lodash/random';

import isAfter from 'date-fns/is_after';
import addDays from 'date-fns/add_days';
import setHours from 'date-fns/set_hours';
import setMinutes from 'date-fns/set_minutes';

export const state = () => {
  return { queue: [], drafts: [], history: [] };
};

export const mutations = {
  // Add
  ADD_POST_REQUEST(state) {
    console.log('Add post pending...');
  },
  ADD_POST_SUCCESS(state, data) {
    const list = data.post.draft ? 'drafts' : 'queue';
    state[list] = [...state[list], data.post];
    console.log('Add post success!');
  },
  ADD_POST_FAILURE(state, error) {
    console.log('Add post failure.');
    console.error(error);
  },

  // Update
  UPDATE_POST_REQUEST(state) {
    console.log('Update post pending...');
  },
  UPDATE_POST_SUCCESS(state, data) {
    const list = data.post.draft ? 'drafts' : 'queue';
    const index = findIndex(state[list], { _id: data.post._id });
    state[list][index] = data.post;
    state[list] = [...state[list]];
    console.log('Update post success!');
  },
  UPDATE_POST_FAILURE(state, error) {
    console.log('Update post failure.');
    console.error(error);
  },

  // Delete
  DELETE_POST_REQUEST(state) {
    console.log('Delete post pending...');
  },
  DELETE_POST_SUCCESS(state, data) {
    const list = data.post.draft ? 'drafts' : 'queue';
    state[list] = state[list].filter(p => p._id !== data.post._id);
    console.log('Delete post success!');
  },
  DELETE_POST_FAILURE(error) {
    console.log('Delete post failure.');
    console.error(error);
  },

  // Posts
  FETCH_POSTS_REQUEST(state) {
    console.log('Fetch posts pending...');
  },
  FETCH_POSTS_SUCCESS(state, data) {
    state.queue = data.posts;
    console.log('Fetch posts success!');
  },
  FETCH_POSTS_FAILURE(state, error) {
    console.log('Fetch posts failure.');
    console.error(error);
  },

  // Drafts
  FETCH_DRAFTS_REQUEST(state) {
    console.log('Fetch drafts pending...');
  },
  FETCH_DRAFTS_SUCCESS(state, data) {
    state.drafts = data.posts;
    console.log('Fetch drafts success!');
  },
  FETCH_DRAFTS_FAILURE(state, error) {
    console.log('Fetch drafts failure.');
    console.error(error);
  },

  // History
  FETCH_HISTORY_REQUEST(state) {
    console.log('Fetch history pending...');
  },
  FETCH_HISTORY_SUCCESS(state, data) {
    state.history = data.posts;
    console.log('Fetch history success!');
  },
  FETCH_HISTORY_FAILURE(state, error) {
    console.log('Fetch history failure.');
    console.error(error);
  }
};

export const actions = {
  async addPost({ commit }, payload) {
    try {
      commit('ADD_POST_REQUEST');
      let { data } = await axios.post('/posts', payload);
      commit('ADD_POST_SUCCESS', data);
      commit('notification/SUCCESS', data, { root: true });
    } catch (error) {
      commit('ADD_POST_FAILURE', error);
      commit('notification/FAILURE', error.response.data, {
        root: true
      });
    }
  },
  async updatePost({ commit }, payload) {
    try {
      commit('UPDATE_POST_REQUEST');
      let { data } = await axios.put(`/posts`, payload);
      commit('UPDATE_POST_SUCCESS', data);
      commit('notification/SUCCESS', data, { root: true });
    } catch (error) {
      commit('UPDATE_POST_FAILURE', error);
      commit('notification/FAILURE', error.response.data, {
        root: true
      });
    }
  },
  async deletePost({ commit }, payload) {
    try {
      commit('DELETE_POST_REQUEST');
      let { data } = await axios.delete(`/posts/${payload._id}`);
      commit('DELETE_POST_SUCCESS', data);
      commit('notification/SUCCESS', data, { root: true });
    } catch (error) {
      commit('DELETE_POST_FAILURE', error);
      commit('notification/FAILURE', error.response.data, {
        root: true
      });
    }
  },
  async fetchPosts({ commit }) {
    try {
      commit('FETCH_POSTS_REQUEST');
      let { data } = await axios.get('/posts');
      commit('FETCH_POSTS_SUCCESS', data);
      commit('notification/SUCCESS', data, { root: true });
    } catch (error) {
      commit('FETCH_POSTS_FAILURE', error);
      commit('notification/FAILURE', error.response.data, {
        root: true
      });
    }
  },
  async fetchDrafts({ commit }) {
    try {
      commit('FETCH_DRAFTS_REQUEST');
      let { data } = await axios.get('/posts/drafts');
      commit('FETCH_DRAFTS_SUCCESS', data);
      commit('notification/SUCCESS', data, { root: true });
    } catch (error) {
      commit('FETCH_DRAFTS_FAILURE', error);
      commit('notification/FAILURE', error.response.data, {
        root: true
      });
    }
  },
  async fetchHistory({ commit }) {
    try {
      commit('FETCH_HISTORY_REQUEST');
      let { data } = await axios.get('/posts/history');
      commit('FETCH_HISTORY_SUCCESS', data);
      commit('notification/SUCCESS', data, { root: true });
    } catch (error) {
      commit('FETCH_HISTORY_FAILURE', error);
      commit('notification/FAILURE', error.response.data, {
        root: true
      });
    }
  },
  async sendPost({ dispatch }, payload) {
    payload.scheduled = new Date();
    dispatch('addPost', payload);
  },
  async queuePost({ state, dispatch }, payload) {
    const oldestPost = state.queue.reduce(
      (p1, p2) => (isAfter(p1.scheduled, p2.scheduled) ? p1 : p2)
    );
    const randomHour = random(8, 20); // between 8 am and 8 pm
    const randomMinute = random(0, 59);
    const nextDay = setMinutes(
      setHours(addDays(oldestPost.scheduled, 1), randomHour),
      randomMinute
    );
    payload.scheduled = nextDay;
    dispatch('addPost', payload);
  },
  async schedulePost({ dispatch }, payload) {
    dispatch('addPost', payload);
  },
  async savePost({ dispatch }, payload) {
    payload.draft = true;
    payload.scheduled = null;
    dispatch('addPost', payload);
  }
};
