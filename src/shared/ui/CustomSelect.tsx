import React, { useEffect, useRef, useState } from 'react'
import { IconCheck, IconChevronDown } from './Icons'

export interface CustomSelectOption<T extends string = string> {
  value: T
  label: string
  sublabel?: string
  disabled?: boolean
  badge?: string
}

export interface CustomSelectProps<T extends string = string> {
  options: CustomSelectOption<T>[]
  value: T
  onChange: (value: T) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
  fullWidth?: boolean
}

export function CustomSelect<T extends string = string>({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
  disabled = false,
  id,
  name,
  required,
  fullWidth = true,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  const selectedOption = options.find(opt => opt.value === value)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync focused index with selected option when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(opt => opt.value === value)
      setFocusedIndex(idx >= 0 ? idx : 0)
    }
  }, [isOpen, options, value])

  const handleSelectOption = (option: CustomSelectOption<T>) => {
    if (option.disabled) return
    onChange(option.value)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else if (focusedIndex >= 0 && focusedIndex < options.length) {
        handleSelectOption(options[focusedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (isOpen) {
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0))
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${isOpen ? 'open' : ''} ${className}`}
      style={{ width: fullWidth ? '100%' : 'auto' }}
    >
      {/* Hidden native select for native accessibility and E2E test runner compatibility */}
      <select
        id={id}
        name={name}
        required={required}
        aria-label={ariaLabel}
        className="custom-select-hidden-native"
        value={value}
        onChange={e => onChange(e.target.value as T)}
        tabIndex={-1}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label} {opt.badge ? `· ${opt.badge}` : ''}
          </option>
        ))}
      </select>

      {/* Styled Dropdown Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        disabled={disabled}
        className="custom-select-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span className="custom-select-value">
          <span className="custom-select-value-text">
            {selectedOption ? selectedOption.label : placeholder || ''}
          </span>
          {selectedOption?.badge && (
            <span className="custom-select-badge">{selectedOption.badge}</span>
          )}
        </span>
        <IconChevronDown className="custom-select-chevron" />
      </button>

      {/* Styled Popover Dropdown Menu */}
      {isOpen && (
        <ul className="custom-select-dropdown" role="listbox" tabIndex={-1}>
          {options.map((opt, idx) => {
            const isSelected = opt.value === value
            const isFocused = idx === focusedIndex
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                className={`custom-select-option ${isSelected ? 'selected' : ''} ${
                  isFocused ? 'focused' : ''
                } ${opt.disabled ? 'disabled' : ''}`}
                onClick={() => handleSelectOption(opt)}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                <div className="custom-select-option-content">
                  <div className="custom-select-option-title">
                    <span>{opt.label}</span>
                    {opt.badge && <span className="custom-select-badge">{opt.badge}</span>}
                  </div>
                  {opt.sublabel && (
                    <span className="custom-select-option-sublabel">{opt.sublabel}</span>
                  )}
                </div>
                {isSelected && <IconCheck className="custom-select-option-check" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
