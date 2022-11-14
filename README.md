# Task #

Given a set of symbol assets and dummy responses create your own very simple slot machine

Your simple slot machine should do the following:

# Main Task #
* Load & display all the symbols in the /assets folder
* Display the players balance & stake amount
* Display a button which simulates a 'spin' such that when clicked it does the following:
	* Deducts players stake from the current balance
	* Randomly selectes a dummy JSON response from the responses I have provided
	* From the response calculate if there was a win, if so add that to the players balance, play the 'win' animations for the correct winning symbols and display the win amount
	* The button must remain disabled until all this has been completed
---

# Bonus Task #
* Make the stake adjustable by the player this should change the amount deducted from the balance when pressing spin
* The stake controls should remain disabled for the duration of the spin and win animations  



* I have setup a basic PIXI game setup for you which contains the SpinePlugin needed to handle the assets and a tweening engine that we use in the gecko framework
* I have also included a basic npm package to setup a locally hosted http-server
* Feel free to modify the environment to your preferances provided their are clear instructions for us to run/build the game  
  
---

* This test is intended to demonstrate
	* your creativity
	* ability to read documentation and implement unfamiliar libraries
	* coding style (we like OOD)   
	
---

* Good luck and have fun 

* The documentation for PIXI, handling spine assets and greesocks tween engine can be found here:
* [PixiJs](https://pixijs.io/examples/#/demos-basic) - Pixi documentation
* [pixi-spine](https://github.com/pixijs/spine/tree/pixi5-spine3.7) - Pixi spine respository
* [GreenSock](https://greensock.com/docs/) - Green socks tween engine documentation
