import { MotivationalQuote } from '@/types/program';

export class MotivationService {
  private static quotes: MotivationalQuote[] = [
    {
      id: 'arnold_1',
      text: 'Сила не приходит от побед. Твои трудности развивают твою силу.',
      author: 'Арнольд Шварценеггер',
      category: 'strength'
    },
    {
      id: 'arnold_2',
      text: 'Неудача - это не вариант. Все думают о том, чтобы стать чемпионом, но никто не думает о тренировках.',
      author: 'Арнольд Шварценеггер',
      category: 'discipline'
    },
    {
      id: 'ronnie_1',
      text: 'Все хотят быть бодибилдерами, но никто не хочет поднимать эти тяжёлые веса.',
      author: 'Ронни Колеман',
      category: 'motivation'
    },
    {
      id: 'ronnie_2',
      text: 'Лёгкий вес, детка! Ничего, кроме лёгкого веса!',
      author: 'Ронни Колеман',
      category: 'motivation'
    },
    {
      id: 'dorian_1',
      text: 'Я тренируюсь с такой интенсивностью, что большинство людей думают, что я сумасшедший.',
      author: 'Дориан Йейтс',
      category: 'discipline'
    },
    {
      id: 'jay_1',
      text: 'Ты должен толкать себя дальше того, на что, как ты думаешь, способен.',
      author: 'Джей Катлер',
      category: 'motivation'
    },
    {
      id: 'lee_1',
      text: 'Размер имеет значение, но качество имеет большее значение.',
      author: 'Ли Хейни',
      category: 'strength'
    },
    {
      id: 'franco_1',
      text: 'Тренировка - это король, питание - это королева, отдых - это принц.',
      author: 'Франко Коломбо',
      category: 'discipline'
    },
    {
      id: 'frank_1',
      text: 'Боль временна, но гордость навсегда.',
      author: 'Фрэнк Зейн',
      category: 'motivation'
    },
    {
      id: 'phil_1',
      text: 'Чемпионы не создаются в залах. Чемпионы создаются из чего-то глубоко внутри них.',
      author: 'Фил Хит',
      category: 'success'
    },
    {
      id: 'coleman_1',
      text: 'Дисциплина - это делание того, что ненавидишь, но делать это как будто любишь.',
      author: 'Майк Тайсон',
      category: 'discipline'
    },
    {
      id: 'motivation_1',
      text: 'Твоё тело может выдержать это. Это твой разум нужно убедить.',
      author: 'Неизвестный',
      category: 'motivation'
    }
  ];

  static getAllQuotes(): MotivationalQuote[] {
    return this.quotes;
  }

  static getDailyQuote(): MotivationalQuote {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % this.quotes.length;
    return this.quotes[quoteIndex];
  }

  static getRandomQuote(): MotivationalQuote {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }

  static getQuotesByCategory(category: MotivationalQuote['category']): MotivationalQuote[] {
    return this.quotes.filter(quote => quote.category === category);
  }

  static getQuotesByAuthor(author: string): MotivationalQuote[] {
    return this.quotes.filter(quote => 
      quote.author.toLowerCase().includes(author.toLowerCase())
    );
  }
}