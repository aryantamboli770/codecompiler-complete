#include <iostream>

// Function to check if a number is prime
bool isPrime(int n) {
    if (n < 2) { // 0, 1, and negative numbers are not prime
        return false;
    }
    // Check for divisors from 2 up to the square root of n
    // If a number has a divisor, it must have one less than or equal to its square root
    for (int i = 2; i * i <= n; i++) { 
        if (n % i == 0) { // If n is divisible by i, it's not prime
            return false;
        }
    }
    return true; // If no divisors found, it's prime
}

int main() {
    int lowerBound = 1;
    int upperBound = 100;

    std::cout << "Prime numbers between " << lowerBound << " and " << upperBound << " are:" << std::endl;

    for (int i = lowerBound; i <= upperBound; i++) {
        if (isPrime(i)) {
            std::cout << i << " ";
        }
    }
    std::cout << std::endl;

    return 0;
}