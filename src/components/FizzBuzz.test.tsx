import { vi, expect, describe, test } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FizzBuzz from './FizzBuzz';

// Mock the SEO component to prevent react-helmet-async errors
vi.mock('./SEO', () => ({
  default: function MockSEO() {
    return null;
  }
}));

describe('FizzBuzz Component', () => {
  test('renders page title', () => {
    render(<FizzBuzz />);
    expect(screen.getByTestId('fizzbuzz-page-title')).toBeInTheDocument();
    expect(screen.getByTestId('fizzbuzz-page-title')).toHaveTextContent('trontronbuzztron');
  });

  test('renders subtitle', () => {
    render(<FizzBuzz />);
    expect(screen.getByText('🤖 robot-powered FizzBuzz sequence generator')).toBeInTheDocument();
  });

  test('renders input section', () => {
    render(<FizzBuzz />);
    expect(screen.getByLabelText('Enter a number for FizzBuzz')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter a number (e.g., 100)')).toBeInTheDocument();
    expect(screen.getByText('Enter a number to generate FizzBuzz sequence:')).toBeInTheDocument();
  });

  test('renders FizzBuzz rules', () => {
    render(<FizzBuzz />);
    expect(screen.getByText('FizzBuzz Rules:')).toBeInTheDocument();
    expect(screen.getByText('Numbers divisible by 3 → "Fizz"')).toBeInTheDocument();
    expect(screen.getByText('Numbers divisible by 5 → "Buzz"')).toBeInTheDocument();
    expect(screen.getByText('Numbers divisible by both 3 and 5 → "FizzBuzz"')).toBeInTheDocument();
    expect(screen.getByText('All other numbers → the number itself')).toBeInTheDocument();
  });

  test('renders info section', () => {
    render(<FizzBuzz />);
    expect(screen.getByText(/FizzBuzz is a classic programming exercise/)).toBeInTheDocument();
  });

  test('handles input change', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    fireEvent.change(input, { target: { value: '15' } });
    expect((input as HTMLInputElement).value).toBe('15');
  });

  test('generates FizzBuzz sequence for valid input', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    fireEvent.change(input, { target: { value: '15' } });
    
    expect(screen.getByText('FizzBuzz')).toBeInTheDocument();
    expect(screen.getByText(/1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz/)).toBeInTheDocument();
  });

  test('does not display sequence for invalid input', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.queryByText('FizzBuzz')).not.toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: '-5' } });
    expect(screen.queryByText('FizzBuzz')).not.toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(screen.queryByText('FizzBuzz')).not.toBeInTheDocument();
  });

  test('generates correct FizzBuzz sequence for different numbers', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    // Test with 5
    fireEvent.change(input, { target: { value: '5' } });
    expect(screen.getByText(/1, 2, Fizz, 4, Buzz/)).toBeInTheDocument();
    
    // Test with 3
    fireEvent.change(input, { target: { value: '3' } });
    expect(screen.getByText(/1, 2, Fizz/)).toBeInTheDocument();
    
    // Test with 1
    fireEvent.change(input, { target: { value: '1' } });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('input has correct attributes', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '1000');
    expect(input).toHaveAttribute('id', 'fizzbuzz-input');
  });

  test('FizzBuzzDisplay component renders correctly', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    fireEvent.change(input, { target: { value: '10' } });
    
    expect(screen.getByText('FizzBuzz')).toBeInTheDocument();
    expect(screen.getByText(/1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz/)).toBeInTheDocument();
  });

  test('sequence updates when input changes', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    // Start with 3
    fireEvent.change(input, { target: { value: '3' } });
    expect(screen.getByText(/1, 2, Fizz/)).toBeInTheDocument();
    
    // Change to 5
    fireEvent.change(input, { target: { value: '5' } });
    expect(screen.getByText(/1, 2, Fizz, 4, Buzz/)).toBeInTheDocument();
    
    // Change to 15
    fireEvent.change(input, { target: { value: '15' } });
    expect(screen.getByText(/1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz/)).toBeInTheDocument();
  });

  test('handles edge cases correctly', () => {
    render(<FizzBuzz />);
    const input = screen.getByLabelText('Enter a number for FizzBuzz');
    
    // Test with 1 (edge case)
    fireEvent.change(input, { target: { value: '1' } });
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Test with 2 (no Fizz/Buzz)
    fireEvent.change(input, { target: { value: '2' } });
    expect(screen.getByText(/1, 2/)).toBeInTheDocument();
    
    // Test with 4 (no Fizz/Buzz)
    fireEvent.change(input, { target: { value: '4' } });
    expect(screen.getByText(/1, 2, Fizz, 4/)).toBeInTheDocument();
  });
}); 