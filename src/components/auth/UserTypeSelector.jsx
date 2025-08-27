// src/components/auth/UserTypeSelector.jsx
import React from 'react';
import { Building2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UserTypeSelector = ({ selectedType, onTypeChange, className = "" }) => {
  const userTypes = [
    {
      value: 'company',
      label: 'Company',
      icon: Building2,
      description: 'Business seeking investment',
      badge: 'Fundraising'
    },
    {
      value: 'investor',
      label: 'Investor',
      icon: TrendingUp,
      description: 'Individual or firm investing',
      badge: 'Investing'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">I am a:</div>
      <div className="grid grid-cols-2 gap-3">
        {userTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          
          return (
            <div
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`
                relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div>
                    <div className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {type.label}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                      {type.description}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={isSelected ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {type.badge}
                </Badge>
              </div>
              
              {/* Selection indicator */}
              <div className={`
                absolute top-2 right-2 h-3 w-3 rounded-full border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300 bg-white'
                }
              `}>
                {isSelected && (
                  <div className="absolute inset-0.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserTypeSelector;
