23/12/2023 v0.3.0
- added state syncing when players join or leave
- added host session menu item under options
  - an name will have to be input and submitted first
  - then a new session will be created
  - with the user joining as storyteller
  - and the session id shown for other players to join
- added join session menu item under options
  - a name and session id will be needed before subitting
  - assuming the session exists it will be joined as a player
- until a session is joined much of the ui will be hidden
- the debug menu has been removed
- the board configuration will now adjust to the nuber of players joined in the session
- the character window now correctly shows the real values of the user
- added storyteller character window which currently only displays the session id
- updated the hardcoded data to include the rest of the rule document
- updated the detailed player view to correctly display the real player state

20/12/2023 v0.2.1
- added websocket server to http backend
- added websocket client to spa
- synced the phase changes
- synced the player attribute changes
- synced the player voting changes
- changed shown attributes to secret attributes
- changed the real attributes to be the values shown to other players and on player indicators
- added special effect to player indicators to show they are dead
- after plays place their vote, the vote buttons will become disabled, disallowing them to vote again

12/12/2023 v0.2.0
- added phase control button for the story teller
- updated the phase indicator to show which numbered day/night it is
- added storyteller version of the player details display
  - this includes inputs for changing a players real attributes
  - and fields for changing a players shown attributes
  - also includes a button for starting this players dismissal
- added storyteller version of player indicators
  - it will now display the shown player attributes in the player indicator
  - there will be an asterisk "*" next to the attribute if it differs from the real attribute
- added more hardcoded dummy values for playing around with e.g. more roles
- added player select modal when dismissing a player
  - this window allows you to select the player nominating player
  - once the begin button is pressed the voting window becomes accessible
- added storyteller version of the voting window
  - this window now shows the player names of those who voted for and against
  - it will also tally the votes for each
  - once the finish button is pressed the voting will end and the window will no longer be accessible until another vote begins
  - for testing purposes currently a player can vote multiple times
- changed board player ordering to clockwise

09/12/2023 v0.1.3
- added dummy story teller debug changer

07/12/2023 v0.1.2
- added nodejs server for serving the SPA
- synced voting window state with clientside players
- improve general responsive design
  - all elements sizes have been refactored
  - board element has been made fully responsive
- added player class
- added initial server side socket boilerplate

06/12/2023 v0.1.1
- updated player indicator spacing and text
- added consistent sizing to the dynamic window
- added voting window

25/11/2023 v0.1.0
- changed repo licence to cc-by-nc-sa 4.0
- added detailed player window
  - this window includes controls for:
  - labels
  - notes
  - roles
  - characteristics
  - statues
  - and a dummy talk button
  - this window also displays the player name and player state
  - this window will remember the entered information for each player
- updated player indicator buttons

18/11/2023 v0.0.2
- renamed page title to SWTC
- resized page components to fit together
- removed page scroll bars
- added text dummy text placements for phase, options, character and chat components
- added iframe of rules to character component

6/11/2023 v0.0.1
- created main board area with auto sizing player 
- blocked out phase, options, character and chat components
- set up server and client project hireachy