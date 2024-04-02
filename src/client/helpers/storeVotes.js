export const createVotesSlice = (set) => ({
  votes: {
    list: [],
    voting: false,
    accusingPlayer: null,
    nominatedPlayer: null,
    userVote: [null, null],
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
      userVote: [null, null]
    }
  })),

  addVoteToList: (newVote) => set(state => {
    if (Array.isArray(newVote)) {
      return {
        votes: {
          ...state.votes,
          list: newVote,
          userVote: [null, null]
        }
      }
    } else {
      return {
        votes: {
          ...state.votes,
          list: [...state.votes.list, newVote]
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

  setVotes: (newVotes) => set(() => ({votes: newVotes})),

  setUserVote: (aVote) => set(state => {
    const large = {
      "backgroundColor": "#2f8bf3",
      "transform": "scale(1.15)"
    }

    return {
      votes: {
        ...state.votes,
        userVote: state.votes.userVote.map((_, index) => {
          return index === aVote ? large : null
        })
      }
    }
  })

})
