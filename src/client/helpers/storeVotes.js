const large = {
  "backgroundColor": "#2f8bf3",
  "transform": "scale(1.15)"
}

export const createVotesSlice = (set) => ({
  votes: {
    list: [],
    voting: false,
    accusingPlayer: null,
    nominatedPlayer: null,
    userVote: [large, false],
  },

  setVoting: (newVoting) => set(state => ({
    votes: {
      ...state.votes,
      voting: newVoting
    }
  })),

  resetUserVotes: () => set(state => ({
    votes: {
      ...state.votes,
      userVote: [large, false]
    }
  })),

  addVoteToList: (newVote) => set(state => {
    if (Array.isArray(newVote)) {
      return {
        votes: {
          ...state.votes,
          list: newVote,
          userVote: [large, false]
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
        })
      }
    }
  })

})
