import { StateCreator } from "zustand";
import { ButtonEnlarger, CombinedSlice, UserVote, VoteHistoryItem, VotesSlice } from "./storeTypes.ts";

const large: ButtonEnlarger = {
  "backgroundColor": "#2f8bf3",
  "transform": "scale(1.15)"
}

export const createVotesSlice: StateCreator<
  CombinedSlice,
  [],
  [],
  VotesSlice
> = (set) => ({
  votes: {
    list: [],
    voting: false,
    accusingPlayer: null,
    nominatedPlayer: null,
    userVote: [false, false],
  },
  voteHistory: [],

  setVoting: (newVoting) => set(state => ({
    votes: {
      ...state.votes,
      voting: newVoting
    }
  })),

  resetUserVotes: () => set(state => ({
    votes: {
      ...state.votes,
      userVote: [false, false]
    }
  })),

  addVoteToList: (newVote) => set(state => {
    if (Array.isArray(newVote)) {
      return {
        votes: {
          ...state.votes,
          list: newVote,
          userVote: [false, false]
        }
      }
    } else {
      const votes = [...state.votes.list];
      const existingVote = votes.find(vote => vote.id === newVote.id)
      if (existingVote) {
        const removeIndex = votes.indexOf(existingVote);
        votes.splice(removeIndex, 1);
      }
      return {
        votes: {
          ...state.votes,
          list: [...votes, newVote]
        }
      }
    }
  }),

  setAccuser: (accusingPlayerId) => set(state => ({
    votes: {
      ...state.votes,
      accusingPlayer: accusingPlayerId
    }
  })),

  setNominated: (nominatedPlayerId, accusingPlayerId) => set(state => ({
    votes: {
      ...state.votes,
      nominatedPlayer: nominatedPlayerId,
      accusingPlayer: accusingPlayerId !== undefined ? accusingPlayerId : state.votes.accusingPlayer
    }
  })),

  setVotes: (newVotes) => set((state) => ({votes: {...state.votes, ...newVotes}})),

  setUserVote: (aVote) => set(state => {
    return {
      votes: {
        ...state.votes,
        userVote: state.votes.userVote.map((_, index) => {
          return index === aVote ? large : false
        }) as [UserVote, UserVote]
      }
    }
  }),

  addVotesToHistory: () => set(state => {

    const players = state.players;
    const accuser = players.find(player => player.id === state.votes.accusingPlayer);
    const nominated = players.find(player => player.id === state.votes.nominatedPlayer);

    if (typeof accuser === "undefined") throw new Error("error adding to vote history accuser not found");
    if (typeof nominated === "undefined") throw new Error("error adding to vote history nominated player not found");

    const newVoteHistoryItem: VoteHistoryItem = {
      day: state.phase.round,
      accuser: accuser.name,
      nominated: nominated.name,
      votes: state.votes.list,
      voterTotal: state.votes.list.filter(aVote => aVote.vote === 1).reduce((acc, cur) => acc + cur.power, 0),
      abstainerTotal: state.votes.list.filter(aVote => aVote.vote === 0).reduce((acc, cur) => acc + cur.power, 0),
    }

    return {
      voteHistory: [
        newVoteHistoryItem,
        ...state.voteHistory.filter(item => item.day > state.phase.round - 2),
      ]
    }

  }),

  calculateVoteHistory: (round) => set(state => ({
    voteHistory: [
      ...state.voteHistory.filter(item => item.day > round - 2)
    ]
  }))

})
