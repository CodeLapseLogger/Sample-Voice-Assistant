// Patterns             : Multiple possible user input and voice responses. Voice responses picked at random.
// Alternatives         : Written within '()', to accommodate multiple words/options in that pattern, 
//                        that users might use to interact with the voice assistant.
// Optional Alternatives: Written within '()', ending with '|' symbol, to signify that it is optional in the
//                        pattern that matches an interaction from the user.

// Coffee and dessert options on the menu
const coffee = [
    {name: 'cappuccino', id: 'cappuccino'},
    {name: 'latte', id: 'latte'},
    {name: 'americano', id: 'americano'}
];

const dessert = [
  {name: 'cheesecake', id: 'cheesecake'},
  {name: 'brownie', id: 'brownie'},
  {name: 'apple pie', id: 'apple-pie'}
];

let coffeePattern = coffee.map((entry) => entry.name).join('|');
let dessertPattern = dessert.map((entry) => entry.name).join('|');
console.log(`coffeePattern: ${coffeePattern}`);
console.log(`dessertPattern: ${dessertPattern}`);

// Possible conversation states
let conversationStates = {
    'initiate-conversation': 'initiate conversation',
    'taking-order': 'taking order',
//     'order-complete': 'order complete',
    'taking-user-details': 'taking user details',
//     'user-details-complete': 'user details complete',
    'end-conversation': 'end conversation'
};

// Initial conversation state
let currentConversationState = conversationStates['initiate-conversation'];

// First interaction with the user. Generic response to let user know what can be ordered. 
intent('What can I order here', 
       'What(s| is) on the menu', 
       'Ok, what now ?', 
       'Can you (please|) tell me what I can get here', p => {
    p.play('You can get coffee and dessert', 
           'Lots of coffee and a bunch of desserts', 
           'Duh ! Coffee with dessert', 
           'Yeah, you can order coffee and dessert');
});

// Voice command to respond to user request to list out coffee options.
// Using command: 'hightlight' to communicate with the client (web app),
// on the appropriate coffee item to be highlighted in the UI, to be in
// sync with the voice response. Appropriate js code needs to be run on
// the front-end.
intent('(Sure|Yes|Ya|Yeah|oh|) What (type|kind|) (of|) $(MENUITEMTYPE coffee|dessert)(s|) do you have ?',
       '(Sure|Yes|Ya|Yeah|oh|) What (are|is) my $(MENUITEMTYPE coffee|dessert) option(s|) ?',
       '(Sure|Yes|Ya|Yeah|oh|) What(s| is) on the $(MENUITEMTYPE coffee|dessert) menu ?',
       '(Sure|Yes|Ya|Yeah|oh|) Can you (list|read) out the $(MENUITEMTYPE coffee|dessert)(s|) (options|menu|) (for me|) ?', p => {
    
     if(currentConversationState !== conversationStates['taking-order']){
         currentConversationState = conversationStates['taking-order'];
     }
    // Determine the requested menu item list based on item type requested by the user
    let requestedMenuItemType = p.MENUITEMTYPE.value;
    let requestedMenuItemList = (requestedMenuItemType === 'coffee') ? coffee : dessert;
    
    // Send back appropriate commands and voice response
    p.play('We have');
   requestedMenuItemList.forEach((listEntry) => {
       // Data sent to client with command to highlight coffee item with given id. 
       p.play({command: 'highlight', item: `${listEntry.id}`}); 
       // Voice response to match the highlighted coffee item.
       p.play(`${listEntry.name}`); 
       // Notice that p.play() is used for both sending data and voice response.
   });
    p.play('What would you like today ?');
});

// Voice command to capture and respond to user specific coffee order.
// Using user-defined slot COFFEE to capture user input and give it to
// Alan AI instance, 'p' to include that input in its voice response 
intent(`(Yes|Ya|Yeah|oh|) I would like (a|an) $(COFFEE~ ${coffeePattern}) (please|as well|with it|) (and|) (thank you|) (kindly|)`, 
       `(Yes|Ya|Yeah|oh|) one $(COFFEE~ ${coffeePattern}) (please|as well|with it|) (and|) (thank you|) (kindly|)`, 
       `(Yes|Ya|Yeah|oh|) I (want|need) (a|an) $(COFFEE~ ${coffeePattern}) (please|as well|with it|) (and|) (thank you|) (kindly|)`, 
       `(Yes|Ya|Yeah|oh|) (Can I get|) (A|one) cup of $(COFFEE~ ${coffeePattern}) (please|as well|with it|) (and|) (thank you|) (kindly|)`, p => {
    
    if(currentConversationState !== conversationStates['taking-order']){
         currentConversationState = conversationStates['taking-order'];
     }
    
    // Extract the id of the matching coffee entry, 
    // taking into consideration the possible permutations
    // of coffee entry names in the user input, accommodated
    // through fuzzy matching done by Alan AI. 
    let userInputCapturedInCoffeeSlot = p.COFFEE.value;
    let tokenizedUserChosenCoffeeEntry = userInputCapturedInCoffeeSlot.split(' '); // Breaks up input into multiple words and returns as an array
    let regExpToMatchUserInputWithCoffeeEntryPattern = new RegExp(`${tokenizedUserChosenCoffeeEntry[0]}`,'i'); // Case-Insensitive as Alan AI can capitalize the captured user choice/input
    let matchingCoffeeEntry = coffee.find((coffeeEntry) => coffeeEntry.name.search(regExpToMatchUserInputWithCoffeeEntryPattern) > -1);
    let coffeeEntryId = matchingCoffeeEntry.id;
    // Send back the command+data for syncing UI visual queue with the voice response. 
    p.play({command: 'addCoffee', item: coffeeEntryId});
    p.play(`Adding a ${p.COFFEE.value} to your order`, 
          'Sure', 
          'Sure thing', 
          'Ok', 
          'You got it', 
          'Coming right up'); 
    p.play('Would you like to have dessert with it ?');
});

// Voice command to capture and respond to user specific dessert order.
// Using user-defined slot DESSERT with options composed as pattern, to
// capture user input which can be embedded in the voice response to make
// it personalized.
intent(`(Yes|Ya|Yeah|oh|)(Can I get|) (a|an|one) $(DESSERT~ ${dessertPattern}) (please|as well|with it|) (and|) (thank you|) (kindly|)`, 
       `(Yes|Ya|Yeah|oh|) I (want|need) (a|an|one) $(DESSERT~ ${dessertPattern}) (please|as well|with it|) (and|) (thank you|) (kindly|)`, 
       `(Yes|Ya|Yeah|oh|) I would like (a|an) $(DESSERT~ ${dessertPattern}) (please|as well|with it|) (and|) (thank you|) (kindly|)`, p => {
    if(currentConversationState !== conversationStates['taking-order']){
         currentConversationState = conversationStates['taking-order'];
     }
    
    // Extract the id of the matching dessert entry, 
    // taking into consideration the possible permutations
    // of dessert entry names in the user input, accommodated
    // through fuzzy matching done by Alan AI. 
    // Ex: User input of just 'pie' or 'pie apple' instead of 'apple pie'. 
    let userInputCapturedInDessertSlot = p.DESSERT.value;
    let tokenizedUserChosenDessertEntry = userInputCapturedInDessertSlot.split(' '); // Breaks up input into multiple words and returns as an array
    let regExpToMatchUserInputWithDessertEntryPattern = new RegExp(`${tokenizedUserChosenDessertEntry[0]}`, 'i'); // Case-Insensitive as Alan AI can capitalize the captured user choice/input 
    let dessertEntryId = dessert.find((dessertEntry) => dessertEntry.name.search(regExpToMatchUserInputWithDessertEntryPattern) > -1).id;
    //Send back the command+data to sync UI visula queue with voice response.
    p.play({command: 'addDessert', item: dessertEntryId});
   p.play(`Sure, adding a ${p.DESSERT.value} to your order`, 
          'Sure', 'Sure thing', 
          'ok', 
          'You got it', 
          'Coming right up');
    p.play('Anything else ?');
});

// Voice command to handle completion of taking order from user,
// and initiating getting user details for the order.
intent('(No|None|Nope|) (that will be all|I am good|that\'s it) (thanks|thank you|appreciate it|) !', p => {
    // Possible intent for user response after finishing up with taking coffee/dessert order
    if(currentConversationState === conversationStates['taking-order']){
        currentConversationState = conversationStates['taking-user-details'];
         p.play('Awesome ! Can I get your name for the order ?');
     }
    // Possible intent for user response after finishing up with taking user details (name, address),
    // and when user has no notes to add for their order.
    else if(currentConversationState === conversationStates['taking-user-details']){
        currentConversationState = conversationStates['end-conversation'];
         p.play('Awesome ! We will get started with your order. Have a nice day !');
     }
});

// Voice command to capture the name of the user
// Using pre-defined slot $(NAME) to capture the user
// input and sending it back to the client for appropriate
// UI synchronization with voice response 
intent('(Sure|Yes|) My name is $(NAME)', 
       '(Sure|Yes|) It(\'s| is) $(NAME)', p => {
    if(currentConversationState !== conversationStates['taking-user-details']){
        currentConversationState = conversationStates['taking-user-details'];
    }
   p.play({command: 'addUserName', userName: `${p.NAME.value}`});
   p.play(`Got it ! Thanks ${p.NAME.value}`, 
          `Alrighty ! Thanks ${p.NAME.value}`, 
          `Ok ! Thanks ${p.NAME.value}`); 
    p.play('Can I have the address for delivering your order ?');
});

// Voice command to capture the address of the user
// Using pre-defined slot $(LOC) to capture input
// user location and send it back with command+data,
// to sycnronize client UI with transmitted voice
// response.
intent('(Sure|Yes|) My address is $(LOC)', 
       '(Sure|Yes|) It(\'s| is) $(LOC)', p => {
    if(currentConversationState !== conversationStates['taking-user-details']){
        currentConversationState = conversationStates['taking-user-details'];
    }
   p.play({command: 'addUserAddress', userAddress: `${p.LOC.value}`}); 
   p.play('Thanks ! Your order will be sent to $(LOC)', 
          'Awesome ! Your order will be delivered to $(LOC)', 
          'Thanks ! Your order will be delivered to $(LOC)', 
          'Awesome ! Your order will be sent to $(LOC)');
    p.play('Also, do you have any special note or request for your order ?');
});

// Voice command to capture the user comment
// Using user-defined slot to capture the comment
// with a regular expression and send back command+data
// to sync up UI with voice response. 
let regExForCommentCapture = '(.+)';
intent(`(Yes|Ya|Yeah|Well) $(NOTES* ${regExForCommentCapture})`, p => {
    if(currentConversationState !== conversationStates['taking-user-details']){
        currentConversationState = conversationStates['taking-user-details'];
    }
    p.play({command: 'addUserNotes', userNotes: p.NOTES.value});
   p.play(`Thank you ! Your note is ${p.NOTES.value}`); 
    p.play('We will get started with your order shortly ! Have a nice day !');
});