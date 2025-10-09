import React, { useState } from 'react';

import { logger } from '../../utils/logger';

import SEO from './SEO';
import '../../styles/FizzBuzz.css';

interface FizzBuzzDisplayProps {
  number: number;
  onGenerate?: () => void;
}

function FizzBuzzDisplay({ number, onGenerate }: FizzBuzzDisplayProps) {
  const generateFizzBuzz = (num: number): string => {
    const result = [];
    for (let i = 1; i <= num; i++) {
      if (i % 3 === 0 && i % 5 === 0) {
        result.push('FizzBuzz');
      } else if (i % 3 === 0) {
        result.push('Fizz');
      } else if (i % 5 === 0) {
        result.push('Buzz');
      } else {
        result.push(i);
      }
    }
    return result.join(', ');
  };

  // Call onGenerate when component renders with a valid number
  React.useEffect(() => {
    if (onGenerate && number > 0) {
      onGenerate();
    }
  }, [number, onGenerate]);

  return (
    <div className='fizzbuzz-container'>
      <h2 className='fizzbuzz-title'>FizzBuzz</h2>
      <p className='fizzbuzz-sequence'>{generateFizzBuzz(number)}</p>
    </div>
  );
}

function FizzBuzz() {
  const [inputNumber, setInputNumber] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    logger.debug('FizzBuzz input changed', {
      inputValue: value,
      isValidNumber: !isNaN(Number(value)) && parseInt(value) > 0,
      timestamp: new Date().toISOString(),
    });

    setInputNumber(value);
  };

  return (
    <div className='fizzbuzz-page'>
      <SEO
        title='TronTronBuzzTron - FizzBuzz Generator | Tron Swan'
        description='Generate FizzBuzz sequences with our robot-powered TronTronBuzzTron. Enter a number and watch the magic happen with this classic programming challenge.'
        keywords='FizzBuzz, programming, algorithm, robot, TronTronBuzzTron, coding challenge'
        url='/trontronbuzztron'
      />

      <div className='fizzbuzz-content'>
        <h1 className='fizzbuzz-page-title' data-testid='fizzbuzz-page-title'>
          trontronbuzztron
        </h1>
        <p className='fizzbuzz-subtitle'>
          🤖 robot-powered FizzBuzz sequence generator
        </p>

        <div className='fizzbuzz-input-section'>
          <label htmlFor='fizzbuzz-input' className='fizzbuzz-label'>
            Enter a number to generate FizzBuzz sequence:
          </label>
          <input
            id='fizzbuzz-input'
            type='number'
            value={inputNumber}
            onChange={handleInputChange}
            placeholder='Enter a number (e.g., 100)'
            aria-label='Enter a number for FizzBuzz'
            min='1'
            max='1000'
            className='fizzbuzz-input'
          />
        </div>

        {inputNumber &&
          !isNaN(Number(inputNumber)) &&
          parseInt(inputNumber) > 0 && (
            <FizzBuzzDisplay
              number={parseInt(inputNumber)}
              onGenerate={() => {
                logger.info('FizzBuzz sequence generated', {
                  inputNumber: parseInt(inputNumber),
                  sequenceLength: parseInt(inputNumber),
                  timestamp: new Date().toISOString(),
                });
              }}
            />
          )}

        <div className='fizzbuzz-rules'>
          <h3>FizzBuzz Rules:</h3>
          <ul>
            <li>Numbers divisible by 3 → &quot;Fizz&quot;</li>
            <li>Numbers divisible by 5 → &quot;Buzz&quot;</li>
            <li>Numbers divisible by both 3 and 5 → &quot;FizzBuzz&quot;</li>
            <li>All other numbers → the number itself</li>
          </ul>
        </div>

        <div className='fizzbuzz-info'>
          <p>
            FizzBuzz is a classic programming exercise that demonstrates basic
            control flow and modular arithmetic. Perfect for testing your robot
            logic circuits!
          </p>
        </div>
      </div>
    </div>
  );
}

export default FizzBuzz;
