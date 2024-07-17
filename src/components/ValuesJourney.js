"use client";

import React, { useState } from 'react';
import { RefreshCw, Check, X, ArrowLeft, ArrowUp, ArrowDown, Edit, SkipForward, Share2, Search } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import valuesData from '../values.json';

const ValuesJourney = () => {
  const initialValues = valuesData;

  const [allValues, setAllValues] = useState(initialValues);
  const [selectedValues, setSelectedValues] = useState([]);
  const [skippedValues, setSkippedValues] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [showFinalSelection, setShowFinalSelection] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentValue = allValues[currentIndex];

  const handleSelection = (action) => {
    setLastAction({ type: action, value: currentValue });
    if (action === 'select') {
      setSelectedValues(prev => [...prev, currentValue]);
    } else if (action === 'skip') {
      setSkippedValues(prev => [...prev, currentValue]);
    }
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < allValues.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowRoundTransition(true);
    }
  };

  const startNextRound = () => {
    if (selectedValues.length === 5) {
      setShowFinalSelection(true);
    } else if (selectedValues.length < 5) {
      const nextRoundValues = [...skippedValues, ...allValues.filter(v => !selectedValues.includes(v) && !skippedValues.includes(v))];
      setAllValues(nextRoundValues);
      setSkippedValues([]);
    } else {
      setAllValues(selectedValues);
      setSelectedValues([]);
    }
    setCurrentIndex(0);
    setRound(prev => prev + 1);
    setShowRoundTransition(false);
    setLastAction(null);
  };

  const handleUndo = () => {
    if (lastAction) {
      if (lastAction.type === 'select') {
        setSelectedValues(prev => prev.filter(v => v.id !== lastAction.value.id));
      } else if (lastAction.type === 'skip') {
        setSkippedValues(prev => prev.filter(v => v.id !== lastAction.value.id));
      }
      setCurrentIndex(prev => prev - 1);
      setLastAction(null);
    }
  };

  const handleChangeValue = (oldValue, newValue) => {
    setSelectedValues(prev => prev.map(v => v.id === oldValue.id ? newValue : v));
  };

  const moveValue = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < selectedValues.length) {
      const updatedValues = [...selectedValues];
      [updatedValues[index], updatedValues[newIndex]] = [updatedValues[newIndex], updatedValues[index]];
      setSelectedValues(updatedValues);
    }
  };

  const copyToClipboard = () => {
    const valuesList = selectedValues.map(v => v.value).join(', ');
    const text = `My top 5 values are ${valuesList}. Find & share your top 5 at top5values.com`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mt-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-full ${
            index < selectedValues.length ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        />
      ))}
      {selectedValues.length > 5 && (
        <div className="flex items-center">
          <span className="text-gray-500 mx-2">+</span>
          {[...Array(selectedValues.length - 5)].map((_, index) => (
            <div
              key={index + 5}
              className="w-4 h-4 rounded-full bg-yellow-500 ml-1"
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderCard = () => (
    <Card className="w-80 h-96 flex flex-col justify-between bg-gradient-to-br from-blue-100 to-purple-100">
      <CardContent className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">{currentValue.value}</h2>
        <p className="text-gray-600 mb-4">{currentValue.definition}</p>
      </CardContent>
      <div className="flex justify-between p-4">
        <Button onClick={() => handleSelection('reject')} variant="outline" className="bg-red-100 hover:bg-red-200">
          <X className="text-red-500" />
        </Button>
        <Button onClick={() => handleSelection('skip')} variant="outline" className="bg-yellow-100 hover:bg-yellow-200">
          <SkipForward className="text-yellow-500" />
        </Button>
        <Button onClick={() => handleSelection('select')} variant="outline" className="bg-green-100 hover:bg-green-200">
          <Check className="text-green-500" />
        </Button>
      </div>
    </Card>
  );

  const renderFinalSelection = () => (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Top 5 Values</h2>
      {selectedValues.map((value, index) => (
        <Card key={value.id} className="mb-4 p-4 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{value.value}</h3>
              <p className="text-gray-600 mt-2">{value.definition}</p>
            </div>
            <div className="flex flex-col">
              <Button onClick={() => moveValue(index, 'up')} variant="outline" size="sm" className="mb-1" disabled={index === 0}>
                <ArrowUp size={16} />
              </Button>
              <Button onClick={() => moveValue(index, 'down')} variant="outline" size="sm" className="mb-1" disabled={index === selectedValues.length - 1}>
                <ArrowDown size={16} />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Value</DialogTitle>
                    <DialogDescription>
                      Search for a new value to replace "{value.value}"
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 opacity-50" />
                    <Input
                      placeholder="Search values..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {initialValues
                      .filter(v => !selectedValues.includes(v) && v.value.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(v => (
                        <Button
                          key={v.id}
                          onClick={() => handleChangeValue(value, v)}
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          {v.value}
                        </Button>
                      ))
                    }
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      ))}
      <div className="flex justify-between mt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center">
              <RefreshCw className="mr-2" />
              Start Over
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Over</DialogTitle>
              <DialogDescription>
                Are you sure you want to start over? All your selections will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => {
                setAllValues(initialValues);
                setSelectedValues([]);
                setSkippedValues([]);
                setCurrentIndex(0);
                setRound(1);
                setShowFinalSelection(false);
              }}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center">
          <Share2 className="mr-2" />
          Share Your Values
        </Button>
      </div>
    </div>
  );

  const renderRoundTransition = () => (
    <Dialog open={showRoundTransition} onOpenChange={setShowRoundTransition}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selection Complete</DialogTitle>
          <DialogDescription>
            {selectedValues.length === 5 
              ? "Great job! You've selected your top 5 values."
              : selectedValues.length < 5
                ? `You've selected ${selectedValues.length} values. You need to select at least 5 values to complete the process.`
                : `You've selected ${selectedValues.length} values. Let's narrow down your selection to 5 values.`
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={startNextRound}>
            {selectedValues.length === 5 ? "View Final Selection" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      {showFinalSelection ? (
        renderFinalSelection()
      ) : (
        <>
          <Alert className="mb-4 max-w-xl">
            <AlertTitle>Round {round}: {round > 1 && selectedValues.length > 5 ? "Narrow Your Selection" : "Select Your Values"}</AlertTitle>
            <AlertDescription>
              {round > 1 && selectedValues.length > 5 
                ? "You're now choosing from your previously selected values. Narrow it down to your top 5."
                : `Select your top values. You've chosen ${selectedValues.length} out of 5 needed.`}
            </AlertDescription>
          </Alert>
          {renderCard()}
          {renderProgressIndicator()}
          <div className="mt-4 text-center">
            <p className="font-bold">Card {currentIndex + 1} of {allValues.length}</p>
          </div>
          <Button onClick={handleUndo} variant="outline" className="mt-4" disabled={!lastAction}>
            <ArrowLeft className="mr-2" />
            Undo Last Action
          </Button>
          {renderRoundTransition()}
        </>
      )}
    </div>
  );
};

export default ValuesJourney;