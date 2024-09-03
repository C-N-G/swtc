### xx/xx/xxx v0.6.1
- changed day night order from day 1, night 1, day 2 ect. to night 1, day 1, night 2 ect.
- roles added or removed:
  - +Medium
  - +Test Subject
  - +Therapist
  - +Turncoat
  - +Warden
  - -Analyst
  - -Janitor
  - -Medic
  - -Precog
  - -Supervisor
  - -Tracker
  - -Trainee
  - -Vessel
- chars added or removed:
  - +Eccentric
  - +Enamoured
  - +Inquisitive
  - +Methodical
  - -Resourceful
  - -Secretive
---

### 24/08/2024 v0.6.0
- changed player details for the player view
  - replaced quick notes input with nickname input, this will change the selected users name
  - changed both role and characteristic inputs to allow arbitrary text
  - added role and characteristic inputs to appear on the player indicator
- added automatic filling in of characteristic, role, and team inputs when syncing a session
- added setup text to show in the scenario dialog
- complete styling overhaul
- added day night cycle colouration to the phase indicator
- added support for url joining
  - added new copy link button next to copy game id button
  - pressing this button will copy a link including the game id to the clipboard
  - loading this url will open the app with the join dialog open and game id already filled in
---

### 02/07/2024 v0.5.4
- added favicon
---

### 26/06/2024 v0.5.3
- converted project to typescript
- converted data files to json5
- small visual changes to the text inside of player indicators
- night order indicators for players now turn green once that night order is marked completed
- night order indicators are now clickable which marks them as completed 
---

### 20/04/2024 v0.5.2
- added selected player ui 
- added show vote button to phase window
- added better verification when joining 
  - join dialog will now display if the session does not exist
  - can no longer join if someone in the session is using your name
- added session resuming functionality
  - added dc timeout which at default has a length of 30 seconds
  - if a player disconnects from a session then the dc timeout will start ticking down
  - when this timeout reaches 0 then the player will be removed from the session
  - if a player joins the session with the name of a player that is timing out, they will join as that player
- added last session local saving
  - when a player performs and attribute update or syncs from the server, they will save a local snapshop of their session
  - when the app connects to the server, such as during a reconnect, it will use this local snapshot to attempt to resume automatically
- fxied night order indicators dispaly bug
---

### 05/04/2024 v0.5.1
- changed starting phase from night 1 to day 1
- changed phase progression:
  - from: night 1 > day 1 > night 2 > day 2 > night 3 > ect
  - to: day 1 > night 1 > day 2 > night 2 > day 3 > ect
---

### 05/04/2024 v0.5.0
- added vote timer
  - synchronised the narrators vote timer with the player
  - players can now only begin voting when the vote timer starts counting down
  - after the vote timer has completed the vote screen is hidden from players
  - the vote screen is only hidden from the narrator after pressing the finish button
  - the narrator can press finish before the vote timer has completed to finish a vote early
- added vote power
  - each player now has a voting power attribute ranging from 0 to 4
  - each player will default to 1 unless changed by the narrator
  - when a player casts a vote, it will count as x times their vote power
- changed voting behaviour
  - players can now change their vote as much as they want while the vote timer is counting down
  - all players start out as abstaining from the narrators perspective
  - when a player changes their vote, their previous vote will be discarded
- added vote history dialog in the narrators character window
  - the vote history gets updated each time a narrator presses the finish button on a vote
  - this dialog will show voting information about the current day and previous day
  - this dialog will show:
    - if there is a most voted player it will show their name
    - in addition if there is a most voted player, it will show if they have garnerd enough votes for dismissal
    - all players that casted a vote
    - all previous votes, including who nominated who, and who voted which way in each voting session
  - once a day is progressed, the history for the day before yesterday will be lost
- changed the player widget for the narrator view
  - added vote power select menu
  - added show true state toggle
    - when toggled this will switch all the state inputs from shown to true
  - hid all true state inputs unless enabled via the toggle
  - this changes has mean the number of inputs has been reduced from 6 to 8 at any one time, leaving more room for reminders
- added narrator stopwatch to the narrators character window
  - it has a simple start/stop button and a reset button
  - this stopwatch will simply count up by the seconds until stopped/reset
  - has automatic time formatting for seconds/minutes/hours
  - due to how javascript handles timing, there is currently no guarantee of it being accurate 
- fixed players disconnecting during voting crash
---

### 31/03/2024 v0.4.5
- updated scenario viewer
  - added char/role attributes
  - sorted roles by category e.g. agent/detrimental/antagonist
  - added night order list
  - the night order only shows sections that have active elements
  - added tabs for switching between the active element list and the night order
---

### 29/03/2024 v0.4.4
- changed night order indicators
  - these indicators are now added to players when randomising if it is currently a night phase
  - these indicators are updated to reflect player removed in the night order list
- changed night order list
  - moved the remove/undo button from inside the dropdown to the main list item
  - added checkboxes next to the list items to signify completion
  - these checkboxes are reset after each night phase
  - made removed night orders unselectable
- added the scenario viewer
  - this shows all characteristics and roles currently selected for use by the narrator
  - also shows ability text for each characteristc and role
  - both the player and narrator can access this
- redesigned the phase window
  - resized the main phase display text and stacked it vertically
  - restyled and organised the buttons in the phase window
---

### 23/03/2024 v0.4.3
- added rulebook link under options
- added view player button to the player details widget
  - pressing this button will bring up the view player dialog
  - this will show the selected players characteristic and role ability text
- added orderType support for characteristics and roles
  - this value corresponds to a placement in the night order
- added night order indicators to player indicators 
  - these only appear during the night phase
  - the appear on the top right corner of the player indicator
  - the number of the indicator represents the placement in the night order
- added night order list dialog for the narrator
  - this dialog can be accessed through the night order button in the phase window
  - this dialog will show a list of players with their placement in the night order
  - each player can be exapnded to show their corresponding ability text 
  - players can be removed from this list through the remove button after expanding a player
  - similarly players can be added back with the undo button under a player
---

### 15/03/2024 v0.4.2
- updated standard procedure module
  - changed assistant, supervisor, and forthright ability text
  - removed bureaucrat, patient, punctual, and reflective
  - added coordinator, adaptable, approachable, and perceptive
- changed vote button text
- added unknown team colour to player indicators
- fixed syncing overwrites local data bug
- fixed showing wrong char/role text bug 
---

### 09/03/2024 v0.4.1
- changed module filtering to now work off ids instead of names, so duplicate attributes/roles should now filter correctly
- renamed "mechanic" to "ability" in the player view of the character window
- removed status attributes from the game
- added the current users name to appear in the character window where their status used to be
- added team colour to the player view for player indicators
- added state colour to the narrator view for player indicators
- changed state colour from red to black
- added automatic quoting for all description text for characteristics and roles
- changed the reminder display inside the player details widget from a tooltip to a chip 
- added a cohesion tracker for the narrator view
  - this simply tracks the cohesion for the current session
  - the cohesion must be update manually using the plus and minus buttons next to the tracker
- added new player joining and leaving server events to prevent syncs from occuring
- added support for the appears property on roles
  - this is used during randomising the board
  - this allows a role to appear as another type and team when viewed by specific teams
  - this is used when a neighbour setup command is encounter
- added an undo button do the narrator view
  - this button only appears while unsynced from the current session
  - pressing this button will revert the narrators state to just before it was unsynced and will turn syncing back on
- updated standard procedure module
  - added role setup commands
  - added role reminders
  - updated characteristic abilities and attributes
  - added characteristic reminders
- renamed "Unkown" state to "Unknown"
- improved the player indicator styling
  - more text can now appear on the player indicator
  - spaces in the quick label box are now respected in the output shown on the player indicator
- added character limits to the player details text input boxes for the player view
- changed the player indicator in the narrator view to see both true and shown attributes if they differ
- added rudementary vote timer to the vote widget for the narrator view
- added improved server diagnostic logging
- fixed role description text from not appearing
- fixed reminder placement error by changing player and reminder ids from integers to strings
- fixed crash that occured when a player left the session while another player was looking at their player details
- fixed reminders from stopping player randomistion while placed
- fixed crash when starting a dismissal vote without selecting a nominating player 
- fixed crash related to player disconnects
---

### 03/03/2024 v0.4.0
- added first module named "Standard Procedure"
- improved setup commands
  - added new Neighbour setup command, this command will cause the player to neighbour a specific target
  - added characteristic support for Add, AddStrict, ShowAs, and Neighbour setup commands
- disallowed dead playesr from voting
- changed the characteristic and role data format
  - types has been changed from an array to a string, and renamed to type
  - teams has been removed from roles, this is now derived from a roles type at load time
---

### 23/02/2024 v0.3.6
- added reminders for the narrator
  - reminders are tied any role or characistic with an ability
  - reminders can be selected from the character window
- added reminder dragging functionality
  - reminders can be added to players by selecting reminder, then dragging it onto a player
  - reminders can be dragged between players to rearrange
  - reminders can be dragged off players to remove them
  - in the player details widget reminders can be seen and clicked on for a detailed tooltip
---

### 17/02/2024 v0.3.5
- changed the player indicator for the narrator view to show the true team instead of the shown team
- added "ShowAs" setup command support
- added partial support for the neighbour property of setup commands
---

### 10/02/2024 v0.3.4
- moved app end point from http://cormacgudge.xyz:3002 to https://cormacgudge.zyx/swtc
- added https support
- reimplemented clipboard copy button next to session id
---

### 09/02/2024 v0.3.3
- added partial setup commands support for roles
  - currently supports the quantity and target arguments
  - commands will not work in all situations e.g. if all players have already been given a role
  - commands currently do not take into account already chosen roles for keeping roles unique
  - commands can currently target the following
    - individual role names
    - any role belonging to a team
    - and role that has a certain tag
- refactored several core functions
- changed the player indicator colour to reflect the players team for in narrator view
- added end to end testing
---

### 02/02/2024 v0.3.2
- added sync button to the narrator view
  - the sync button contains two components, button itself, and the toggle to its left
  - the toggle indicates if the narrators changes to players will be synced live to other players
  - when the toggle is off the player can make as much chnages as they want, before finally syncing the changes
  - once off the toggle can only be turned on again by pressing the sync button
  - changing modules or pressing the randomise players button will disable autoSyncing
  - the toggle can also be manually toggled off if the narrator would like to update players without them being synced
- added new entries to the players view of the character window
  - this window will now display team, attributes, and role setup
- added team changing functionality
  - the narrators view of the player details widget now includes inputs for both shown and real team values
  - the players view of the player details wiget now inlcudes a team input
  - also in the players view of the same widget, the player state is now shown below the player name
- improved the randomise players logic
  - the function will now choose exactly one antagonist role, and two detrimental roles
---

### 26/01/2023 v0.3.1
- created strings directory for storing game related data e.g. roles and characteristics
  - created data loading logic so future future data can be added easily
  - organised loading and storage directory to incorporate module functionality
  - currently data is sorted in alphabetical order (with the exception of "Unknown" whish is a special value)
- added new game data source to player indicators, player details, and character window
- added new module select button to the character window in the narrator view 
  - synced module selection to all connected clients of a session
  - players and narrators can now only select roles and chars from enabled modules
  - the button also shows how many modules are currently selected
- added server error checking for invalid sessions
- added randomiser button to character window in the narrator view
  - current functionality will choose a random role and characteristic for all connected clients
  - each role and characteristic can only be chosen once, unless there are less roles or characteristics than connect clients
  - aside from that there is currently no special logic involved, and all choises are complete random
  - as such the narrator may wish to make some changes after randomising
  - this feature is synced and will impact all connect clients immediately
- added copy button to the session id section of the character window for the narrator
- updated the character window for players
  - removed the Iframe to the rulebook pdf
  - added locally stored game data text specific to that players role and characteristic
  - removed the team section in the character window
  - slightly reformatted the content
  - added scrollability to the window if the role or characteristic text is too long
- added input validation to the host and join dialogues, also added some helper text
  - also added keyboard event listeners to the input fields so pressing enter will now active them
- fixed player order bug
- fixed logical error in vote adding
- fixed bug with session id not updating after leaving a session
---

### 23/12/2023 v0.3.0
- added state syncing when players join or leave
- added host session menu item under options
  - an name will have to be input and submitted first
  - then a new session will be created
  - with the user joining as narrator
  - and the session id shown for other players to join
- added join session menu item under options
  - a name and session id will be needed before subitting
  - assuming the session exists it will be joined as a player
- until a session is joined much of the ui will be hidden
- the debug menu has been removed
- the board configuration will now adjust to the nuber of players joined in the session
- the character window now correctly shows the real values of the user
- added narrator character window which currently only displays the session id
- updated the hardcoded data to include the rest of the rule document
- updated the detailed player view to correctly display the real player state
---

### 20/12/2023 v0.2.1
- added websocket server to http backend
- added websocket client to spa
- synced the phase changes
- synced the player attribute changes
- synced the player voting changes
- changed shown attributes to secret attributes
- changed the real attributes to be the values shown to other players and on player indicators
- added special effect to player indicators to show they are dead
- after plays place their vote, the vote buttons will become disabled, disallowing them to vote again
---

### 12/12/2023 v0.2.0
- added phase control button for the story teller
- updated the phase indicator to show which numbered day/night it is
- added narrator version of the player details display
  - this includes inputs for changing a players real attributes
  - and fields for changing a players shown attributes
  - also includes a button for starting this players dismissal
- added narrator version of player indicators
  - it will now display the shown player attributes in the player indicator
  - there will be an asterisk "*" next to the attribute if it differs from the real attribute
- added more hardcoded dummy values for playing around with e.g. more roles
- added player select modal when dismissing a player
  - this window allows you to select the player nominating player
  - once the begin button is pressed the voting window becomes accessible
- added narrator version of the voting window
  - this window now shows the player names of those who voted for and against
  - it will also tally the votes for each
  - once the finish button is pressed the voting will end and the window will no longer be accessible until another vote begins
  - for testing purposes currently a player can vote multiple times
- changed board player ordering to clockwise
---

### 09/12/2023 v0.1.3
- added dummy story teller debug changer
---

### 07/12/2023 v0.1.2
- added nodejs server for serving the SPA
- synced voting window state with clientside players
- improve general responsive design
  - all elements sizes have been refactored
  - board element has been made fully responsive
- added player class
- added initial server side socket boilerplate
---

### 06/12/2023 v0.1.1
- updated player indicator spacing and text
- added consistent sizing to the dynamic window
- added voting window
---

### 25/11/2023 v0.1.0
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
---

### 18/11/2023 v0.0.2
- renamed page title to SWTC
- resized page components to fit together
- removed page scroll bars
- added text dummy text placements for phase, options, character and chat components
- added iframe of rules to character component
---

### 6/11/2023 v0.0.1
- created main board area with auto sizing player 
- blocked out phase, options, character and chat components
- set up server and client project hireachy
---