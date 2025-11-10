/**
 * LUCA Platform Tunisia Features
 * Comprehensive Tunisia-specific features and localization
 */

import { config } from './config';

// Tunisia-specific Types
interface TunisianHoliday {
  date: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type: 'national' | 'religious' | 'cultural';
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  isWorkingDay: boolean;
}

interface TunisianBusinessHours {
  day: string;
  dayAr: string;
  dayFr: string;
  isWorkingDay: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface TunisianCurrency {
  code: string;
  symbol: string;
  name: string;
  nameAr: string;
  nameFr: string;
  exchangeRate: number;
  lastUpdated: string;
}

interface TunisianLocation {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type: 'governorate' | 'delegation' | 'city' | 'village';
  parentId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  population?: number;
  postalCode?: string;
}

interface TunisianPhoneNumber {
  number: string;
  type: 'mobile' | 'landline' | 'fax';
  operator?: string;
  formatted: string;
  international: string;
}

interface TunisianDateFormat {
  format: string;
  example: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
}

// Tunisia Features Service Class
class TunisiaFeaturesService {
  private holidays: TunisianHoliday[] = [];
  private businessHours: TunisianBusinessHours[] = [];
  private locations: TunisianLocation[] = [];
  private currency: TunisianCurrency | null = null;

  constructor() {
    this.initializeHolidays();
    this.initializeBusinessHours();
    this.initializeLocations();
    this.initializeCurrency();
  }

  // Holidays Management
  private initializeHolidays(): void {
    this.holidays = [
      {
        date: '2024-01-01',
        name: 'New Year\'s Day',
        nameAr: 'رأس السنة الميلادية',
        nameFr: 'Jour de l\'An',
        type: 'national',
        description: 'Celebration of the new year',
        descriptionAr: 'احتفال برأس السنة الجديدة',
        descriptionFr: 'Célébration de la nouvelle année',
        isWorkingDay: false,
      },
      {
        date: '2024-01-14',
        name: 'Revolution Day',
        nameAr: 'عيد الثورة',
        nameFr: 'Jour de la Révolution',
        type: 'national',
        description: 'Commemoration of the Tunisian Revolution',
        descriptionAr: 'إحياء ذكرى الثورة التونسية',
        descriptionFr: 'Commemoration de la Révolution tunisienne',
        isWorkingDay: false,
      },
      {
        date: '2024-03-20',
        name: 'Independence Day',
        nameAr: 'عيد الاستقلال',
        nameFr: 'Jour de l\'Indépendance',
        type: 'national',
        description: 'Celebration of Tunisia\'s independence from France',
        descriptionAr: 'احتفال باستقلال تونس عن فرنسا',
        descriptionFr: 'Célébration de l\'indépendance de la Tunisie',
        isWorkingDay: false,
      },
      {
        date: '2024-04-09',
        name: 'Martyrs\' Day',
        nameAr: 'عيد الشهداء',
        nameFr: 'Jour des Martyrs',
        type: 'national',
        description: 'Commemoration of those who died for Tunisia',
        descriptionAr: 'إحياء ذكرى من ضحوا بحياتهم من أجل تونس',
        descriptionFr: 'Commemoration de ceux qui sont morts pour la Tunisie',
        isWorkingDay: false,
      },
      {
        date: '2024-05-01',
        name: 'Labour Day',
        nameAr: 'عيد العمال',
        nameFr: 'Fête du Travail',
        type: 'national',
        description: 'International Workers\' Day',
        descriptionAr: 'عيد العمال العالمي',
        descriptionFr: 'Fête internationale du Travail',
        isWorkingDay: false,
      },
      {
        date: '2024-07-25',
        name: 'Republic Day',
        nameAr: 'عيد الجمهورية',
        nameFr: 'Fête de la République',
        type: 'national',
        description: 'Celebration of the Tunisian Republic',
        descriptionAr: 'احتفال بالجمهورية التونسية',
        descriptionFr: 'Célébration de la République tunisienne',
        isWorkingDay: false,
      },
      {
        date: '2024-08-13',
        name: 'Women\'s Day',
        nameAr: 'عيد المرأة',
        nameFr: 'Fête de la Femme',
        type: 'national',
        description: 'Celebration of Tunisian women\'s rights',
        descriptionAr: 'احتفال بحقوق المرأة التونسية',
        descriptionFr: 'Célébration des droits des femmes tunisiennes',
        isWorkingDay: false,
      },
      {
        date: '2024-10-15',
        name: 'Evacuation Day',
        nameAr: 'عيد الجلاء',
        nameFr: 'Jour de l\'Évacuation',
        type: 'national',
        description: 'Commemoration of the evacuation of French troops',
        descriptionAr: 'إحياء ذكرى جلاء القوات الفرنسية',
        descriptionFr: 'Commemoration de l\'évacuation des troupes françaises',
        isWorkingDay: false,
      },
    ];
  }

  private initializeBusinessHours(): void {
    this.businessHours = [
      {
        day: 'monday',
        dayAr: 'الاثنين',
        dayFr: 'Lundi',
        isWorkingDay: true,
        startTime: '08:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '14:00',
      },
      {
        day: 'tuesday',
        dayAr: 'الثلاثاء',
        dayFr: 'Mardi',
        isWorkingDay: true,
        startTime: '08:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '14:00',
      },
      {
        day: 'wednesday',
        dayAr: 'الأربعاء',
        dayFr: 'Mercredi',
        isWorkingDay: true,
        startTime: '08:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '14:00',
      },
      {
        day: 'thursday',
        dayAr: 'الخميس',
        dayFr: 'Jeudi',
        isWorkingDay: true,
        startTime: '08:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '14:00',
      },
      {
        day: 'friday',
        dayAr: 'الجمعة',
        dayFr: 'Vendredi',
        isWorkingDay: true,
        startTime: '08:00',
        endTime: '13:00',
      },
      {
        day: 'saturday',
        dayAr: 'السبت',
        dayFr: 'Samedi',
        isWorkingDay: false,
        startTime: '09:00',
        endTime: '13:00',
      },
      {
        day: 'sunday',
        dayAr: 'الأحد',
        dayFr: 'Dimanche',
        isWorkingDay: false,
        startTime: '09:00',
        endTime: '13:00',
      },
    ];
  }

  private initializeLocations(): void {
    this.locations = [
      {
        id: 'tunis',
        name: 'Tunis',
        nameAr: 'تونس',
        nameFr: 'Tunis',
        type: 'governorate',
        coordinates: { lat: 36.8065, lng: 10.1815 },
        population: 1056247,
      },
      {
        id: 'ariana',
        name: 'Ariana',
        nameAr: 'أريانة',
        nameFr: 'Ariana',
        type: 'governorate',
        coordinates: { lat: 36.8665, lng: 10.1647 },
        population: 576088,
      },
      {
        id: 'ben_arous',
        name: 'Ben Arous',
        nameAr: 'بن عروس',
        nameFr: 'Ben Arous',
        type: 'governorate',
        coordinates: { lat: 36.7531, lng: 10.2189 },
        population: 631842,
      },
      {
        id: 'manouba',
        name: 'Manouba',
        nameAr: 'منوبة',
        nameFr: 'Manouba',
        type: 'governorate',
        coordinates: { lat: 36.8078, lng: 10.0972 },
        population: 379518,
      },
      {
        id: 'bizerte',
        name: 'Bizerte',
        nameAr: 'بنزرت',
        nameFr: 'Bizerte',
        type: 'governorate',
        coordinates: { lat: 37.2744, lng: 9.8739 },
        population: 568219,
      },
      {
        id: 'nabeul',
        name: 'Nabeul',
        nameAr: 'نابل',
        nameFr: 'Nabeul',
        type: 'governorate',
        coordinates: { lat: 36.4561, lng: 10.7376 },
        population: 787920,
      },
      {
        id: 'sousse',
        name: 'Sousse',
        nameAr: 'سوسة',
        nameFr: 'Sousse',
        type: 'governorate',
        coordinates: { lat: 35.8256, lng: 10.6411 },
        population: 674971,
      },
      {
        id: 'monastir',
        name: 'Monastir',
        nameAr: 'المنستير',
        nameFr: 'Monastir',
        type: 'governorate',
        coordinates: { lat: 35.7781, lng: 10.8262 },
        population: 548828,
      },
      {
        id: 'mahdia',
        name: 'Mahdia',
        nameAr: 'المهدية',
        nameFr: 'Mahdia',
        type: 'governorate',
        coordinates: { lat: 35.5047, lng: 11.0622 },
        population: 410812,
      },
      {
        id: 'sfax',
        name: 'Sfax',
        nameAr: 'صفاقس',
        nameFr: 'Sfax',
        type: 'governorate',
        coordinates: { lat: 34.7406, lng: 10.7603 },
        population: 955421,
      },
    ];
  }

  private initializeCurrency(): void {
    this.currency = {
      code: 'TND',
      symbol: 'د.ت',
      name: 'Tunisian Dinar',
      nameAr: 'دينار تونسي',
      nameFr: 'Dinar tunisien',
      exchangeRate: 3.1, // Example rate to USD
      lastUpdated: new Date().toISOString(),
    };
  }

  // Public Methods

  // Get holidays
  getHolidays(year?: number): TunisianHoliday[] {
    if (year) {
      return this.holidays.filter(holiday => 
        new Date(holiday.date).getFullYear() === year
      );
    }
    return this.holidays;
  }

  // Check if date is holiday
  isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays.some(holiday => holiday.date === dateStr);
  }

  // Get holiday by date
  getHolidayByDate(date: Date): TunisianHoliday | null {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays.find(holiday => holiday.date === dateStr) || null;
  }

  // Get business hours
  getBusinessHours(): TunisianBusinessHours[] {
    return this.businessHours;
  }

  // Check if date is working day
  isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const businessDay = this.businessHours.find(bh => bh.day === dayOfWeek);
    
    if (!businessDay) return false;
    if (!businessDay.isWorkingDay) return false;
    
    // Check if it's a holiday
    if (this.isHoliday(date)) return false;
    
    return true;
  }

  // Get next working day
  getNextWorkingDay(date: Date): Date {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (!this.isWorkingDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  }

  // Get locations
  getLocations(type?: 'governorate' | 'delegation' | 'city' | 'village'): TunisianLocation[] {
    if (type) {
      return this.locations.filter(location => location.type === type);
    }
    return this.locations;
  }

  // Get location by ID
  getLocationById(id: string): TunisianLocation | null {
    return this.locations.find(location => location.id === id) || null;
  }

  // Search locations
  searchLocations(query: string, language: 'ar' | 'fr' | 'en' = 'en'): TunisianLocation[] {
    const searchKey = language === 'ar' ? 'nameAr' : language === 'fr' ? 'nameFr' : 'name';
    return this.locations.filter(location => 
      location[searchKey].toLowerCase().includes(query.toLowerCase())
    );
  }

  // Format phone number
  formatPhoneNumber(phoneNumber: string): TunisianPhoneNumber {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    let formatted = '';
    let type: 'mobile' | 'landline' | 'fax' = 'mobile';
    let operator = '';
    
    if (cleaned.startsWith('216')) {
      // International format
      const localNumber = cleaned.substring(3);
      if (localNumber.startsWith('2') || localNumber.startsWith('3') || localNumber.startsWith('4') || localNumber.startsWith('5') || localNumber.startsWith('9')) {
        type = 'mobile';
        operator = this.getMobileOperator(localNumber);
        formatted = `+216 ${localNumber.substring(0, 2)} ${localNumber.substring(2, 4)} ${localNumber.substring(4, 6)} ${localNumber.substring(6)}`;
      } else {
        type = 'landline';
        formatted = `+216 ${localNumber.substring(0, 2)} ${localNumber.substring(2, 4)} ${localNumber.substring(4)}`;
      }
    } else if (cleaned.startsWith('2') || cleaned.startsWith('3') || cleaned.startsWith('4') || cleaned.startsWith('5') || cleaned.startsWith('9')) {
      // Local mobile format
      type = 'mobile';
      operator = this.getMobileOperator(cleaned);
      formatted = `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6)}`;
    } else {
      // Local landline format
      type = 'landline';
      formatted = `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4)}`;
    }
    
    return {
      number: cleaned,
      type,
      operator,
      formatted,
      international: `+216${cleaned}`,
    };
  }

  // Get mobile operator
  private getMobileOperator(phoneNumber: string): string {
    const prefix = phoneNumber.substring(0, 2);
    switch (prefix) {
      case '20':
      case '21':
      case '22':
      case '23':
      case '24':
      case '25':
      case '26':
      case '27':
      case '28':
      case '29':
        return 'Tunisie Télécom';
      case '40':
      case '41':
      case '42':
      case '43':
      case '44':
      case '45':
      case '46':
      case '47':
      case '48':
      case '49':
        return 'Ooredoo';
      case '50':
      case '51':
      case '52':
      case '53':
      case '54':
      case '55':
      case '56':
      case '57':
      case '58':
      case '59':
        return 'Orange';
      case '90':
      case '91':
      case '92':
      case '93':
      case '94':
      case '95':
      case '96':
      case '97':
      case '98':
      case '99':
        return 'Tunisie Télécom';
      default:
        return 'Unknown';
    }
  }

  // Format currency
  formatCurrency(amount: number, language: 'ar' | 'fr' | 'en' = 'en'): string {
    if (!this.currency) return amount.toString();
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
    
    if (language === 'ar') {
      return `${formattedAmount} ${this.currency.symbol}`;
    } else if (language === 'fr') {
      return `${formattedAmount} ${this.currency.symbol}`;
    } else {
      return `${this.currency.symbol} ${formattedAmount}`;
    }
  }

  // Format date
  formatDate(date: Date, language: 'ar' | 'fr' | 'en' = 'en'): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    
    if (language === 'ar') {
      return date.toLocaleDateString('ar-TN', options);
    } else if (language === 'fr') {
      return date.toLocaleDateString('fr-FR', options);
    } else {
      return date.toLocaleDateString('en-US', options);
    }
  }

  // Format time
  formatTime(date: Date, language: 'ar' | 'fr' | 'en' = 'en'): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    
    if (language === 'ar') {
      return date.toLocaleTimeString('ar-TN', options);
    } else if (language === 'fr') {
      return date.toLocaleTimeString('fr-FR', options);
    } else {
      return date.toLocaleTimeString('en-US', options);
    }
  }

  // Get currency info
  getCurrency(): TunisianCurrency | null {
    return this.currency;
  }

  // Get date formats
  getDateFormats(): TunisianDateFormat[] {
    return [
      {
        format: 'DD/MM/YYYY',
        example: '25/12/2024',
        description: 'Day/Month/Year format',
        descriptionAr: 'تنسيق اليوم/الشهر/السنة',
        descriptionFr: 'Format Jour/Mois/Année',
      },
      {
        format: 'MM/DD/YYYY',
        example: '12/25/2024',
        description: 'Month/Day/Year format',
        descriptionAr: 'تنسيق الشهر/اليوم/السنة',
        descriptionFr: 'Format Mois/Jour/Année',
      },
      {
        format: 'YYYY-MM-DD',
        example: '2024-12-25',
        description: 'ISO date format',
        descriptionAr: 'تنسيق التاريخ المعياري',
        descriptionFr: 'Format de date ISO',
      },
    ];
  }
}

// Export singleton instance
export const tunisiaFeatures = new TunisiaFeaturesService();

// Export types
export type {
  TunisianHoliday,
  TunisianBusinessHours,
  TunisianCurrency,
  TunisianLocation,
  TunisianPhoneNumber,
  TunisianDateFormat,
};
