import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/card.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async onModuleInit() {
    await this.seedCards();
  }

  async seedCards() {
    const count = await this.cardRepository.count();
    if (count > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database with 20 cards...');

    const cards: Partial<Card>[] = [
      // --- CS (Computer Science) ---
      {
        title: 'Big O Notation',
        summary: 'Understand algorithmic efficiency.',
        content: '# Big O Notation\n\nBig O notation describes the performance or complexity of an algorithm. Big O specifically describes the worst-case scenario, and can be used to describe the execution time required or the space used (e.g. in memory or on disk) by an algorithm.',
        type: 'LEARN',
        category: 'CS',
        difficultyLevel: 3,
        mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        tags: ['algorithms', 'complexity', 'interview'],
      },
      {
        title: 'React Hooks',
        summary: 'Unlock the power of functional components.',
        content: '# React Hooks\n\nHooks are functions that let you "hook into" React state and lifecycle features from function components.\n\n- `useState`: Manage local state.\n- `useEffect`: Perform side effects.\n- `useContext`: Subscribe to context.',
        type: 'LEARN',
        category: 'CS',
        difficultyLevel: 2,
        mediaUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
        tags: ['react', 'frontend', 'javascript'],
      },
      {
        title: 'REST vs GraphQL',
        summary: 'Comparing API architectures.',
        content: '# REST vs GraphQL\n\n**REST** exposes a fixed structure of data for each endpoint.\n\n**GraphQL** allows the client to request exactly the data it needs, avoiding over-fetching and under-fetching.',
        type: 'LEARN',
        category: 'CS',
        difficultyLevel: 3,
        mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80',
        tags: ['api', 'web', 'architecture'],
      },
      {
        title: 'Docker Basics',
        summary: 'Containerize your applications.',
        content: '# Docker\n\nDocker is a platform for developing, shipping, and running applications. It separates your applications from your infrastructure so you can deliver software quickly.',
        type: 'LEARN',
        category: 'CS',
        difficultyLevel: 3,
        mediaUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80',
        tags: ['devops', 'containers', 'docker'],
      },
      {
        title: 'Quiz: JS Basics',
        summary: 'Test your JavaScript knowledge.',
        content: '# Quiz\n\nWhat is the output of `typeof null`?\n\nA. "null"\nB. "undefined"\nC. "object"\nD. "number"\n\n**Answer:** C. "object" (This is a simplified example).',
        type: 'QUIZ',
        category: 'CS',
        difficultyLevel: 1,
        mediaUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
        tags: ['javascript', 'quiz', 'basics'],
      },

      // --- Math ---
      {
        title: 'Pythagorean Theorem',
        summary: 'a² + b² = c²',
        content: '# Pythagorean Theorem\n\nIn a right-angled triangle, the square of the hypotenuse side is equal to the sum of squares of the other two sides.\n\n$$a^2 + b^2 = c^2$$',
        type: 'LEARN',
        category: 'Math',
        difficultyLevel: 1,
        mediaUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        tags: ['geometry', 'basics', 'triangle'],
      },
      {
        title: 'Calculus: Derivatives',
        summary: 'Rate of change.',
        content: '# Derivatives\n\nThe derivative of a function of a real variable measures the sensitivity to change of the function value (output value) with respect to a change in its argument (input value).',
        type: 'LEARN',
        category: 'Math',
        difficultyLevel: 4,
        mediaUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80', // Reuse math img
        tags: ['calculus', 'advanced', 'change'],
      },
      {
        title: 'Fibonacci Sequence',
        summary: 'The Golden Ratio in numbers.',
        content: '# Fibonacci Sequence\n\nAlso known as the golden spiral. 0, 1, 1, 2, 3, 5, 8, 13, 21...\n\nEach number is the sum of the two preceding ones.',
        type: 'LEARN',
        category: 'Math',
        difficultyLevel: 2,
        mediaUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
        tags: ['numbers', 'nature', 'math'],
      },
      {
        title: 'Linear Algebra',
        summary: 'Vectors and Matrices.',
        content: '# Linear Algebra\n\nBranch of mathematics concerning linear equations, linear maps and their representations in vector spaces and through matrices.',
        type: 'LEARN',
        category: 'Math',
        difficultyLevel: 4,
        mediaUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        tags: ['algebra', 'vectors', 'matrices'],
      },
      {
        title: 'Quiz: Multiplication',
        summary: 'Quick mental math.',
        content: '# Quiz\n\nWhat is 12 * 12?\n\n- 124\n- 144\n- 164\n\n**Answer:** 144',
        type: 'QUIZ',
        category: 'Math',
        difficultyLevel: 1,
        mediaUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        tags: ['arithmetic', 'quiz'],
      },

      // --- History ---
      {
        title: 'The Renaissance',
        summary: 'Rebirth of art and culture.',
        content: '# The Renaissance\n\nA fervent period of European cultural, artistic, political and economic "rebirth" following the Middle Ages. Generally starting in the 14th century.',
        type: 'LEARN',
        category: 'History',
        difficultyLevel: 2,
        mediaUrl: 'https://images.unsplash.com/photo-1553654063-54cd4db20d1c?auto=format&fit=crop&w=800&q=80', // Rome/Art
        tags: ['europe', 'art', 'culture'],
      },
      {
        title: 'Ancient Egypt',
        summary: 'Pyramids and Pharaohs.',
        content: '# Ancient Egypt\n\nA civilization of ancient North Africa, concentrated along the lower reaches of the Nile River. Known for pyramids, mummies, and hieroglyphs.',
        type: 'LEARN',
        category: 'History',
        difficultyLevel: 2,
        mediaUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
        tags: ['egypt', 'africa', 'ancient'],
      },
      {
        title: 'World War II',
        summary: 'Global conflict 1939-1945.',
        content: '# World War II\n\nA global war that lasted from 1939 to 1945. It involved the vast majority of the world\'s countries—including all of the great powers—forming two opposing military alliances: the Allies and the Axis.',
        type: 'LEARN',
        category: 'History',
        difficultyLevel: 3,
        mediaUrl: 'https://images.unsplash.com/photo-1549643444-245f782c5e52?auto=format&fit=crop&w=800&q=80', // Historical
        tags: ['war', '20th century', 'global'],
      },
      {
        title: 'The Moon Landing',
        summary: 'One small step for man.',
        content: '# Apollo 11\n\nOn July 20, 1969, American astronauts Neil Armstrong and Buzz Aldrin landed the Apollo Lunar Module Eagle on the Moon.',
        type: 'LEARN',
        category: 'History',
        difficultyLevel: 1,
        mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        tags: ['space', 'usa', '1969'],
      },
      {
        title: 'Quiz: French Revolution',
        summary: 'When did it start?',
        content: '# Quiz\n\nWhat year did the French Revolution storm the Bastille?\n\n- 1776\n- 1789\n- 1812\n\n**Answer:** 1789',
        type: 'QUIZ',
        category: 'History',
        difficultyLevel: 2,
        mediaUrl: 'https://images.unsplash.com/photo-1563695286591-689b02221b2d?auto=format&fit=crop&w=800&q=80', // Paris
        tags: ['france', 'revolution', 'quiz'],
      },

      // --- Mixed / Other ---
      {
        title: 'Photosynthesis',
        summary: 'How plants eat sunlight.',
        content: '# Photosynthesis\n\nThe process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism\'s activities.',
        type: 'LEARN',
        category: 'Biology',
        difficultyLevel: 2,
        mediaUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5d2294c?auto=format&fit=crop&w=800&q=80',
        tags: ['nature', 'plants', 'science'],
      },
      {
        title: 'The Great Barrier Reef',
        summary: 'Largest living structure.',
        content: '# Great Barrier Reef\n\nLocated off the coast of Queensland, Australia, it is the world\'s largest coral reef system.',
        type: 'LEARN',
        category: 'Geography',
        difficultyLevel: 1,
        mediaUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
        tags: ['ocean', 'australia', 'nature'],
      },
      {
        title: 'Quantum Physics Intro',
        summary: 'Particles and Waves.',
        content: '# Quantum Mechanics\n\nA fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.',
        type: 'LEARN',
        category: 'Physics',
        difficultyLevel: 5,
        mediaUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        tags: ['quantum', 'hard', 'physics'],
      },
      {
        title: 'Stock Market Basics',
        summary: 'Bulls and Bears.',
        content: '# Stock Market\n\nThe aggregation of buyers and sellers of stocks (also called shares), which represent ownership claims on businesses.',
        type: 'LEARN',
        category: 'Economics',
        difficultyLevel: 3,
        mediaUrl: 'https://images.unsplash.com/photo-1611974765270-ca6e1128adc5?auto=format&fit=crop&w=800&q=80',
        tags: ['finance', 'money', 'business'],
      },
      {
        title: 'Javascript Event Loop',
        summary: 'How JS works under the hood.',
        content: '# Event Loop\n\nJavaScript has a runtime model based on an event loop, which is responsible for executing the code, collecting and processing events, and executing queued sub-tasks.',
        type: 'LEARN',
        category: 'CS',
        difficultyLevel: 4,
        mediaUrl: 'https://images.unsplash.com/photo-1550439062-609f15112e11?auto=format&fit=crop&w=800&q=80',
        tags: ['javascript', 'advanced', 'runtime'],
      },
    ];

    await this.cardRepository.save(cards);
    console.log('Seeding complete!');
  }
}
