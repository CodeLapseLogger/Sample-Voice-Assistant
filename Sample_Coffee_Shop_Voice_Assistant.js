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

// Voice command to capture and respond to user specific coffee order.
// Using user-defined slot COFFEE to capture user input and give it to
// Alan AI instance, 'p' to include that input in its voice response 
intent(`I would like a $(COFFEE ${coffeePattern})`, 
       `one $(COFFEE ${coffeePattern}) (please|)`, 
       `I (want|need) a $(COFFEE ${coffeePattern})`, 
       `(Can I get|) (A|one) cup of $(COFFEE ${coffeePattern}) (please|)`, p => {
   p.play(`Adding a ${p.COFFEE.value} to your order`, 
          'Sure', 
          'Sure thing', 
          'Ok', 
          'You got it', 
          'Coming right up'); 
});

// Voice command to capture and respond to user specific dessert order.
// Using user-defined slot DESSERT with options composed as pattern, to
// capture user input which can be embedded in the voice response to make
// it personalized.
intent(`(Can I get|) (a|one) $(DESSERT ${dessertPattern}) (please|)`, 
       `I (want|need) (a|one) $(DESSERT ${dessertPattern})`, 
       `I would like a $(DESSERT ${dessertPattern}) (please|)`, p => {
   p.play(`Sure, adding a ${p.DESSERT.value} to your order`, 
          'Sure', 'Sure thing', 
          'ok', 
          'You got it', 
          'Coming right up'); 
});

// Voice command to capture the name of the user
// Using pre-defined slot $(NAME)
intent('My name is $(NAME)', 
       'It(s| is) $(NAME)', p => {
   p.play(`Got it ! Thanks ${p.NAME.value}`, 
          `Alrighty ! Thanks ${p.NAME.value}`, 
          `Ok ! Thanks ${p.NAME.value}`); 
});

// Voice command to capture the address of the user
// Using pre-defined slot $(LOC)
intent('My address is $(LOC)', 
       'It(s| is) $(LOC)', p => {
   p.play('Thanks ! Your order will be sent to $(LOC)', 
          'Awesome ! Your order will be delivered to $(LOC)', 
          'Thanks ! Your order will be delivered to $(LOC)', 
          'Awesome ! Your order will be sent to $(LOC)') 
});

// Voice command to capture the user comment
// Using user-defined slot to capture the comment
// with a regular expression.
let regExForCommentCapture = '(.+)';
intent(`My comment is $(NOTE* ${regExForCommentCapture})`, p => {
   p.play(`Thank you ! Your comment is ${p.NOTE.value}`); 
});