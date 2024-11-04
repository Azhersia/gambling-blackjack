"use client";
import { useState, useEffect } from "react";
import RandomCard from "./components/RandomCard";

const initialDeck = [
  "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H",
  "JH", "QH", "KH", "AH", "2D", "3D", "4D", "5D", "6D",
  "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AD", "2C",
  "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC",
  "QC", "KC", "AC", "2S", "3S", "4S", "5S", "6S", "7S",
  "8S", "9S", "10S", "JS", "QS", "KS", "AS"
];

// Get the value of a card, removing the suit and converting faces to values
function getCardValue(card: string) {
  const rank = card.slice(0, -1); // Extract rank (value) from card
  if (rank === 'A') return 11; // Consider Ace as 11
  if (['K', 'Q', 'J'].includes(rank)) return 10; // Face cards worth 10
  return parseInt(rank); // Return the number value for others
}

// Calculate the total value of a hand of cards
function calculateHandValue(handCards: string[]): number {
  let total = 0;
  let aceCount = 0;

  // Calculate the total value and count Aces
  for (const card of handCards) {
    const value = getCardValue(card);
    console.log(`Card: ${card}, Value: ${value}`); // Log the card and its value
    total += value;

    if (value === 11) {
      aceCount++; // Count how many Aces are in the hand
    }
  }

  // Adjust for Aces if total exceeds 21
  while (total > 21 && aceCount > 0) {
    total -= 10; // Convert one Ace from 11 to 1
    aceCount--;   // Reduce the count of Aces
  }

  console.log(`Final Hand Value: ${total}`); // Log final hand value
  return total;
}

// Function to draw a random card from the deck
function drawRandomCard(deck: string[]) {
  const randomIndex = Math.floor(Math.random() * deck.length);
  const card = deck[randomIndex];
  const updatedDeck = [...deck];
  updatedDeck.splice(randomIndex, 1); // Remove the drawn card from the deck
  return { card, updatedDeck };
}

export default function Home() {

  const [deck, setDeck] = useState<string[]>(initialDeck); // Current deck of cards
  const [playerCards, setPlayerCards] = useState<string[]>([]); // Player's cards
  const [dealerCards, setDealerCards] = useState<string[]>([]); // Dealer's cards
  const [dealerTotal, setDealerTotal] = useState(0); // Dealer's total
  const [playerTotal, setPlayerTotal] = useState(0); // Player's total
  const [gameActive, setGameActive] = useState(true); // Game state
  const [dealerTurn, setDealerTurn] = useState(false); // Dealer's turn
  const [gameResult, setGameResult] = useState<string | null>(null);

useEffect(() => {
  let currentDeck = [...deck];

  // Draw 2 cards for the player
  const newPlayerCards = [];
  for (let i = 0; i < 2; i++) {
    const { card, updatedDeck } = drawRandomCard(currentDeck);
    newPlayerCards.push(card);
    currentDeck = updatedDeck;
  }

  // Draw 2 cards for the dealer
  const newDealerCards = [];
  for (let i = 0; i < 2; i++) {
    const { card, updatedDeck } = drawRandomCard(currentDeck);
    newDealerCards.push(card);
    currentDeck = updatedDeck;
  }

  // Update the hands and deck in state
  setPlayerCards(newPlayerCards);
  setDealerCards(newDealerCards);
  setDeck(currentDeck);

  // Calculate initial totals
  const initialPlayerTotal = calculateHandValue(newPlayerCards);
  const initialDealerTotal = calculateHandValue(newDealerCards);
  setPlayerTotal(initialPlayerTotal);
  setDealerTotal(initialDealerTotal);

  // Check for Blackjack (21 with exactly 2 cards)
  if (initialPlayerTotal === 21 && newPlayerCards.length === 2) {
    console.log(initialPlayerTotal)
    setGameResult("Blackjack! You win!");
    setGameActive(false);
  } else if (initialDealerTotal === 21 && newDealerCards.length === 2) {
    console.log(initialDealerTotal)
    setGameResult("Dealer has Blackjack! You lose!");
    setGameActive(false);
  }
}, [console.log("render")]);

  const handleHit = () => {
    if (!gameActive) return;
  
    const { card, updatedDeck } = drawRandomCard(deck);
    setDeck(updatedDeck);
  
    setPlayerCards((prevCards) => {
      const newCards = [...prevCards, card];
      const newPlayerTotal = calculateHandValue(newCards);
      setPlayerTotal(newPlayerTotal);
  
      if (newPlayerTotal === 21) {
        console.log(newPlayerTotal)
        setGameResult("Blackjack! You win!");
        setGameActive(false); // End game
      } else if (newPlayerTotal > 21) {
        setGameResult("You bust!");
        setGameActive(false); // End game
      }
  
      return newCards;
    });
  };

  const handleStand = () => {
    if (!gameActive) return;
    setDealerTurn(true);
    setGameActive(false);
  
    let currentDealerTotal = dealerTotal;
    let currentDeck = [...deck];
    const newDealerCards = [...dealerCards];
  
    while (currentDealerTotal < 17) {
      const { card, updatedDeck } = drawRandomCard(currentDeck);
      newDealerCards.push(card);
      currentDealerTotal = calculateHandValue(newDealerCards);
      currentDeck = updatedDeck;
    }
  
    setDealerCards(newDealerCards);
    setDeck(currentDeck);
    setDealerTotal(currentDealerTotal);
  
    // Determine the outcome after the dealer's turn
    if (currentDealerTotal > 21) {
      setGameResult("Dealer busts! You win!");
    } else if (currentDealerTotal > playerTotal) {
      setGameResult("Dealer wins!");
    } else if (currentDealerTotal < playerTotal) {
      setGameResult("You win!");
    } else {
      setGameResult("It's a draw!");
    }
  };

  return (
<div className="flex justify-center items-center flex-col min-h-screen">
  <div className="flex justify-center items-center flex-col gap-32">
    {/* Dealer's cards and total */}
    <div className="flex justify-center items-center flex-col gap-10">
      <div className="flex justify-center items-center gap-3">
        {dealerCards.length > 0 && (
          <>
            <RandomCard card={dealerCards[0]} />
            <RandomCard card={dealerCards[1]} />
          </>
        )}
      </div>
      <p>{dealerTotal}</p>
    </div>

    {/* Game result message */}
    {gameResult && <p className="text-xl">{gameResult}</p>}

    {/* Player's cards and total */}
    <div className="flex justify-center items-center flex-col gap-10">
      <h1>{playerTotal}</h1>
      <div className="flex justify-center items-center gap-3">
        {playerCards.length > 0 && (
          <>
            <RandomCard card={playerCards[0]} />
            <RandomCard card={playerCards[1]} />
            {playerCards.slice(2).map((card, index) => (
              <RandomCard key={index} card={card} />
            ))}
          </>
        )}
      </div>
    </div>
  </div>

  {/* Hit and Stand buttons */}
  <div className="mt-10 flex justify-center items-center gap-10 flex-row">
    <button onClick={handleHit} disabled={!gameActive}>Hit</button>
    <button onClick={handleStand} disabled={!gameActive}>Stand</button>
  </div>
</div>
  );
}