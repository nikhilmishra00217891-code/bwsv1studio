
"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import type { MobileNumber } from '@/types';

export const countries = [
    { code: '+91', name: 'India', flag: '🇮🇳', digits: 10 },
    { code: '+1', name: 'USA', flag: '🇺🇸', digits: 10 },
    { code: '+44', name: 'UK', flag: '🇬🇧', digits: 10 },
    { code: '+61', name: 'Australia', flag: '🇦🇺', digits: 9 },
];

interface PhoneNumberInputProps {
    value: MobileNumber;
    onChange: (value: MobileNumber) => void;
    id?: string;
    className?: string;
    inputClassName?: string;
    required?: boolean;
}

export function PhoneNumberInput({ value, onChange, id, className, inputClassName, required }: PhoneNumberInputProps) {
    const [number, setNumber] = useState(value?.number || '');
    const [countryCode, setCountryCode] = useState(value?.countryCode || '+91');
    const [isValid, setIsValid] = useState(true);

    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

    useEffect(() => {
        setNumber(value?.number || '');
        setCountryCode(value?.countryCode || '+91');
    }, [value]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, ''); // Allow only digits
        if (input.length <= selectedCountry.digits) {
            setNumber(input);
            validateAndChange(input, countryCode);
        }
    };
    
    const handleCountryChange = (newCountryCode: string) => {
        setCountryCode(newCountryCode);
        validateAndChange(number, newCountryCode);
    }

    const validateAndChange = (currentNumber: string, currentCode: string) => {
        const country = countries.find(c => c.code === currentCode) || countries[0];
        const valid = currentNumber.length === country.digits;
        setIsValid(valid);
        onChange({ countryCode: currentCode, number: currentNumber });
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Select value={countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-[80px]">
                    <SelectValue>
                        <span className='text-sm'>{selectedCountry.flag}</span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {countries.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                            {c.flag} {c.code}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="relative w-full">
                <Input
                    id={id}
                    type="tel"
                    placeholder={`${selectedCountry.digits}-digit number`}
                    value={number}
                    onChange={handleNumberChange}
                    className={cn(
                        "pr-12",
                        inputClassName,
                        !isValid && number.length > 0 && "border-destructive focus-visible:ring-destructive"
                    )}
                    required={required}
                    maxLength={selectedCountry.digits}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className={cn(
                        "text-xs text-muted-foreground",
                        number.length === selectedCountry.digits && "text-green-500",
                        number.length > 0 && number.length < selectedCountry.digits && "text-destructive"
                    )}>
                        {number.length}/{selectedCountry.digits}
                    </span>
                </div>
            </div>
        </div>
    );
}
