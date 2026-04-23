// experienceSteps.tsx

type Choice = string;

type LikertRow = {
  id: string;
  label: string;
  value?: string;
};

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number' | 'date' | 'likert-group';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (value: string) => void;
  choice?: Choice[];

  // Likert additions
  likertRows?: LikertRow[];
  likertLabels?: string[];
  likertMinLabel?: string;
  likertMaxLabel?: string;
  onMatrixChange?: (rowId: string, value: string) => void;

  required?: boolean;
};

export type Step = {
  id: string;
  label: string;
  description: string;
  question: Question[];
};

export const stepsByGroup: Record<number, Step[]> = {
  1: [
    {
      id: '1',
      label: 'Instructions',
      description: 'Group 1/2 instructions here...',
      question: []
    },
    {
      id: '2',
      label: 'Four positive books about the world',
      description: `
        <strong>Factfulness – Hans Rosling with Ola Rosling and Anna Rosling Rönnlund </strong>

        In Factfulness, Professor Hans Rosling, along with two collaborators, asks simple questions about the world. Questions like 'How many girls finish school?' and 'What percentage of the world's population is poor?' It turns out the majority of us get the answers to these questions completely wrong. Why does this happen? Factfulness sets out to explain why, showing that there are several instincts humans have that distort our perspective.

        For example, most people divide the world into US and THEM. In addition, we often believe that things are getting worse. And we are consuming large amounts of media that use a sales model based on making us afraid.

        But according to the authors, the world isn't as bad as we think. Yes, there are real concerns. But we should adopt a mindset of factfulness – only carrying opinions that are supported by strong facts. This book is not concerned with the underlying reasons for poverty or progress, or what should be done about these issues. It focuses on our instinctive biases, offering practical advice to help us see the good as well as the bad in the world.

        <strong>Enlightenment Now – Steven Pinker</strong>

        Are things getting worse every day? Is progress an impossible goal? In Enlightenment Now, Steven Pinker looks at the big picture of human progress and finds good news. We are living longer, healthier, freer and happier lives. Pinker asks us to stop paying so much attention to negative headlines and news that declares the end of the world. Instead, he shows us some carefully selected data. In 75 surprising graphs, we see that safety, peace, knowledge and health are getting better all over the world. When the evidence does not support his argument, however, he dismisses it. Economic inequality, he claims, is not really a problem, because it is not actually that important for human well-being. One cannot help wondering how many people actually living in poverty would agree.

        The real problem, Pinker argues, is that the Enlightenment values of reason and science are under attack. When commentators and demagogues appeal to people's tribalism, fatalism and distrust, then we are in danger of causing irreparable damage to important institutions like democracy and world co-operation.

        <strong>The Rational Optimist – Matt Ridley</strong>

        For more than two hundred years the pessimists have been winning the public debate. They tell us that things are getting worse. But in fact, life is getting better. Income, food availability and lifespan are rising; disease, violence and child mortality are falling. These trends are happening all around the world. Africa is slowly coming out of poverty, just as Asia did before. The internet, mobile phones and worldwide trade are making the lives of millions of people much better.

        Best-selling author Matt Ridley doesn't only explain how things are getting better; he gives us reasons why as well. He shows us how human culture evolves in a positive direction thanks to the exchange of ideas and specialisation. This bold book looks at the entirety of human history – from the Stone Age to the 21st century – and changes the notion that it's all going downhill. The glass really is half-full

        <strong>The Great Surge – Steven Radelet </strong>

        The majority of people believe that developing countries are in a terrible situation: suffering from incredible poverty, governed by dictators and with little hope for any meaningful change. But, surprisingly, this is far from the truth. The reality is that a great transformation is occurring. Over the past 20 years, more than 700 million people have increased their income and come out of poverty. Additionally, six million fewer children die every year from disease, millions more girls are in school and millions of people have access to clean water.

        This is happening across developing countries around the world. The end of the Cold War, the development of new technologies and brave new leadership have helped to improve the lives of hundreds of millions of people in poor countries.

        The Great Surge describes how all of this is happening and, more importantly, it shows us how we can accelerate the process.
        `,
      question: [
        {
          id: 'E1_R1_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. Which book talks about how we can continue to make things even better?`,
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
        {
          id: 'E1_R1_Q2',
          label: '2. Which book covers a long period of human history?',
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
        {
          id: 'E1_R1_Q3',
          label: '3. Which book claims that human intuition negatively affects the way people think about the world?',
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
        {
          id: 'E1_R1_Q4',
          label: '4. Which book says that current establishments are under threat from politics?',
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
      ]
    },
    {
      id: '3',
      label: 'How humans evolved language',
      description: `
        <strong>A</strong>

        Thanks to the field of linguistics we know much about the development of the 5,000 plus languages in existence today. We can describe their grammar and pronunciation and see how their spoken and written forms have changed over time. For example, we understand the origins of the Indo-European group of languages, which includes Norwegian, Hindi and English, and can trace them back to tribes in eastern Europe in about 3000 BC.

        So, we have mapped out a great deal of the history of language, but there are still areas we know little about. Experts are beginning to look to the field of evolutionary biology to find out how the human species developed to be able to use language. So far, there are far more questions and half-theories than answers.

        <strong>B</strong>

        We know that human language is far more complex than that of even our nearest and most intelligent relatives like chimpanzees. We can express complex thoughts, convey subtle emotions and communicate about abstract concepts such as past and future. And we do this following a set of structural rules, known as grammar. Do only humans use an innate system of rules to govern the order of words? Perhaps not, as some research may suggest dolphins share this capability because they are able to recognise when these rules are broken.

        <strong>C</strong>

        If we want to know where our capability for complex language came from, we need to look at how our brains are different from other animals. This relates to more than just brain size; it is important what other things our brains can do and when and why they evolved that way. And for this there are very few physical clues; artefacts left by our ancestors don't tell us what speech they were capable of making. One thing we can see in the remains of early humans, however, is the development of the mouth, throat and tongue. By about 100,000 years ago, humans had evolved the ability to create complex sounds. Before that, evolutionary biologists can only guess whether or not early humans communicated using more basic sounds.

        <strong>D</strong>

        Another question is, what is it about human brains that allowed language to evolve in a way that it did not in other primates? At some point, our brains became able to make our mouths produce vowel and consonant sounds, and we developed the capacity to invent words to name things around us. These were the basic ingredients for complex language. The next change would have been to put those words into sentences, similar to the 'protolanguage' children use when they first learn to speak. No one knows if the next step – adding grammar to signal past, present and future, for example, or plurals and relative clauses – required a further development in the human brain or was simply a response to our increasingly civilised way of living together.

        Between 100,000 and 50,000 years ago, though, we start to see the evidence of early human civilisation, through cave paintings for example; no one knows the connection between this and language. Brains didn't suddenly get bigger, yet humans did become more complex and more intelligent. Was it using language that caused their brains to develop? Or did their more complex brains start producing language?

        <strong>E</strong>

        More questions lie in looking at the influence of genetics on brain and language development. Are there genes that mutated and gave us language ability? Researchers have found a gene mutation that occurred between 200,000 and 100,000 years ago, which seems to have a connection with speaking and how our brains control our mouths and face. Monkeys have a similar gene, but it did not undergo this mutation. It's too early to say how much influence genes have on language, but one day the answers might be found in our DNA.
        `,
      question: [
        {
          id: 'E1_R2_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. Experts fully understand how the Hindi language developed.`,
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
        {
          id: 'E1_R2_Q2',
          label: '2. The grammar of dolphin language follows the same rules as human language.',
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
        {
          id: 'E1_R2_Q3',
          label: '3. Brain size is not the only factor in determining language capability.',
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
        {
          id: 'E1_R2_Q4',
          label: '4. The language of very young children has something in common with the way our prehistoric ancestors may have spoken.',
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
      ]
    },
    {
      id: '4',
      label: 'The state of the world',
      description: `
      If your view of the world comes from watching the news and reading newspapers, you could be forgiven for lying awake at night worrying about the future. Apparently, rising violence and population rates mean humans are both killing each other in ever larger numbers and being born at rates the world's resources can't sustain. To make matters worse, all the wealth is concentrated on a handful of people in the world's richest countries. People in low-income countries live in poverty while the West gets richer. Depressing, isn't it?

      But do the statistics support our negative world view or is the world actually improving?

      Let's take global population first. It's around 7 billion now, in line with figures predicted by the UN in 1958. By the year 2100, the same experts predict it will be around 11 billion. But did you know that 11 billion is probably as high as that number will get? The rate of increase will slow down in the second half of this century thanks to falling birth rates today.

      Falling birth rates? Yes, that's right.

      In the last two centuries, improvements in technology and health meant fewer children died young, fuelling rapid population growth. These large families produced even more children who survived into adulthood and had their own children. But with the wider availability of contraception in the 1960s, the global average number of babies per woman has declined from six babies per woman to as low as two.

      The biggest factor in child mortality is poverty. And while it's still true that only 20 per cent of the world takes about 74 per cent of the world's income, 60 per cent of the world now falls into a middle-income group, with 11.6 per cent – the smallest amount of people in history – still living in conditions of extreme poverty. If the majority of the world's people have money, international aid could realistically achieve the UN target of eradicating poverty by 2030. As poverty goes down, life expectancy goes up, birth rates go down because parents can expect their existing children to survive, and the global population stabilises.

      As for news stories that make us think the world is an increasingly violent place, there is cause for some optimism too. Between the end of World War II and 1990, there were 30 wars that killed more than 100,000 people. Today there are still civil wars, but countries are mostly co-existing more peacefully than in the past. However, terrorism has shot up in the last few years and, since World War II, wars have killed many more civilians than soldiers. Even for civilians, though, the statistics are not all bad. Although deaths are nine times more likely to be a result of violent crime than political conflict, the global murder rate fell slightly, from 8 per 100,000 people in 2000 to about 5.3 in 2015.

      Of course, none of this means the world is perfect, and whether you personally are affected by war and poverty is often down to the lottery of where you're born. Also, we still face huge problems of our own making, particularly environmental ones like global warming, and wealth and natural resources need to be distributed more fairly. But not all the news is bad news, whatever the TV and newspapers might say.
      `,
      question: [
        {
          id: 'E1_R3_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. What does the word 'apparently' in the first paragraph tell us about the rise in violence we see in the news?`,
          type: 'multiple-choice',
          choice: ["The rise is obviously true", "The rise seems true but evidence might show it isn't", "The rise seems false but evidence might show it's true"],
          required: true
        },
        {
          id: 'E1_R3_Q2',
          label: '2. Which statement about population levels is correct?',
          type: 'multiple-choice',
          choice: ["About two hundred years ago, the child mortality rate started to drop significantly", "The rate is growing steadily now", "The rate will start to drop in the year 2100"],
          required: true
        },
        {
          id: 'E1_R3_Q3',
          label: '3. Which factor does NOT cause the birth rate to fall?',
          type: 'multiple-choice',
          choice: ["Improvements in healthcare", "The availability of contraception", "Poverty"],
          required: true
        },
        {
          id: 'E1_R3_Q4',
          label: "4. One of the UN's targets for 2030 is to ...",
          type: 'multiple-choice',
          choice: ["end poverty", "increase life expectancy", "make population levels stable"],
          required: true
        },
      ]
    },
    {
      id: '5',
      label: 'IMI Questions',
      description: `
      `,
      question: [
        {
          id: 'E1_IMI_Q1',
          label: `<strong>Answer the following questions:</strong>`,
          type: 'likert-group',
          likertRows: [
            { id: 'E1_IMI_Q1', label: "1. While I was reading this material, I was thinking about how much I enjoyed it." },
            { id: 'E1_IMI_Q2', label: "2. I did not feel at all nervous while reading." },
            { id: 'E1_IMI_Q3', label: "3. This material did not hold my attention at all." },
            { id: 'E1_IMI_Q4', label: "4. I think I understood this material pretty well." },
            { id: 'E1_IMI_Q5', label: "5. I would describe this material as very interesting." },
            { id: 'E1_IMI_Q6', label: "6. I think I understood this material very well, compared to other students." },
            { id: 'E1_IMI_Q7', label: "7. I enjoyed reading this material very much." },
            { id: 'E1_IMI_Q8', label: "8. I felt very tense while reading this material." },
            { id: 'E1_IMI_Q9', label: "9. This material was fun to read." }
          ],
          required: true
        },
      ]
    },
  ],

  2: [
    {
      id: '1',
      label: 'Instructions',
      description: 'Group 1/2 instructions here...',
      question: []
    },
    {
      id: '2',
      label: 'Four positive books about the world',
      description: `
        <strong>Factfulness – Hans Rosling with Ola Rosling and Anna Rosling Rönnlund </strong>

        In Factfulness, Professor Hans Rosling, along with two collaborators, asks simple questions about the world. Questions like 'How many girls finish school?' and 'What percentage of the world's population is poor?' It turns out the majority of us get the answers to these questions completely wrong. Why does this happen? Factfulness sets out to explain why, showing that there are several instincts humans have that distort our perspective.

        For example, most people divide the world into US and THEM. In addition, we often believe that things are getting worse. And we are consuming large amounts of media that use a sales model based on making us afraid.

        But according to the authors, the world isn't as bad as we think. Yes, there are real concerns. But we should adopt a mindset of factfulness – only carrying opinions that are supported by strong facts. This book is not concerned with the underlying reasons for poverty or progress, or what should be done about these issues. It focuses on our instinctive biases, offering practical advice to help us see the good as well as the bad in the world.

        <strong>Enlightenment Now – Steven Pinker</strong>

        Are things getting worse every day? Is progress an impossible goal? In Enlightenment Now, Steven Pinker looks at the big picture of human progress and finds good news. We are living longer, healthier, freer and happier lives. Pinker asks us to stop paying so much attention to negative headlines and news that declares the end of the world. Instead, he shows us some carefully selected data. In 75 surprising graphs, we see that safety, peace, knowledge and health are getting better all over the world. When the evidence does not support his argument, however, he dismisses it. Economic inequality, he claims, is not really a problem, because it is not actually that important for human well-being. One cannot help wondering how many people actually living in poverty would agree.

        The real problem, Pinker argues, is that the Enlightenment values of reason and science are under attack. When commentators and demagogues appeal to people's tribalism, fatalism and distrust, then we are in danger of causing irreparable damage to important institutions like democracy and world co-operation.

        <strong>The Rational Optimist – Matt Ridley</strong>

        For more than two hundred years the pessimists have been winning the public debate. They tell us that things are getting worse. But in fact, life is getting better. Income, food availability and lifespan are rising; disease, violence and child mortality are falling. These trends are happening all around the world. Africa is slowly coming out of poverty, just as Asia did before. The internet, mobile phones and worldwide trade are making the lives of millions of people much better.

        Best-selling author Matt Ridley doesn't only explain how things are getting better; he gives us reasons why as well. He shows us how human culture evolves in a positive direction thanks to the exchange of ideas and specialisation. This bold book looks at the entirety of human history – from the Stone Age to the 21st century – and changes the notion that it's all going downhill. The glass really is half-full

        <strong>The Great Surge – Steven Radelet </strong>

        The majority of people believe that developing countries are in a terrible situation: suffering from incredible poverty, governed by dictators and with little hope for any meaningful change. But, surprisingly, this is far from the truth. The reality is that a great transformation is occurring. Over the past 20 years, more than 700 million people have increased their income and come out of poverty. Additionally, six million fewer children die every year from disease, millions more girls are in school and millions of people have access to clean water.

        This is happening across developing countries around the world. The end of the Cold War, the development of new technologies and brave new leadership have helped to improve the lives of hundreds of millions of people in poor countries.

        The Great Surge describes how all of this is happening and, more importantly, it shows us how we can accelerate the process.
        `,
      question: [
        {
          id: 'E1_R1_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. Which book talks about how we can continue to make things even better?
          `,
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
        {
          id: 'E1_R1_Q2',
          label: '2. Which book covers a long period of human history?',
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
        {
          id: 'E1_R1_Q3',
          label: '3. Which book claims that human intuition negatively affects the way people think about the world?',
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
        {
          id: 'E1_R1_Q4',
          label: '4. Which book says that current establishments are under threat from politics?',
          type: 'multiple-choice',
          choice: ["Factfulness", "Enlightenment Now", "The Rational Optimist", "The Great Surge"],
          required: true
        },
      ]
    },
    {
      id: '3',
      label: 'How humans evolved language',
      description: `
        <strong>A</strong>

        Thanks to the field of linguistics we know much about the development of the 5,000 plus languages in existence today. We can describe their grammar and pronunciation and see how their spoken and written forms have changed over time. For example, we understand the origins of the Indo-European group of languages, which includes Norwegian, Hindi and English, and can trace them back to tribes in eastern Europe in about 3000 BC.

        So, we have mapped out a great deal of the history of language, but there are still areas we know little about. Experts are beginning to look to the field of evolutionary biology to find out how the human species developed to be able to use language. So far, there are far more questions and half-theories than answers.

        <strong>B</strong>

        We know that human language is far more complex than that of even our nearest and most intelligent relatives like chimpanzees. We can express complex thoughts, convey subtle emotions and communicate about abstract concepts such as past and future. And we do this following a set of structural rules, known as grammar. Do only humans use an innate system of rules to govern the order of words? Perhaps not, as some research may suggest dolphins share this capability because they are able to recognise when these rules are broken.

        <strong>C</strong>

        If we want to know where our capability for complex language came from, we need to look at how our brains are different from other animals. This relates to more than just brain size; it is important what other things our brains can do and when and why they evolved that way. And for this there are very few physical clues; artefacts left by our ancestors don't tell us what speech they were capable of making. One thing we can see in the remains of early humans, however, is the development of the mouth, throat and tongue. By about 100,000 years ago, humans had evolved the ability to create complex sounds. Before that, evolutionary biologists can only guess whether or not early humans communicated using more basic sounds.

        <strong>D</strong>

        Another question is, what is it about human brains that allowed language to evolve in a way that it did not in other primates? At some point, our brains became able to make our mouths produce vowel and consonant sounds, and we developed the capacity to invent words to name things around us. These were the basic ingredients for complex language. The next change would have been to put those words into sentences, similar to the 'protolanguage' children use when they first learn to speak. No one knows if the next step – adding grammar to signal past, present and future, for example, or plurals and relative clauses – required a further development in the human brain or was simply a response to our increasingly civilised way of living together.

        Between 100,000 and 50,000 years ago, though, we start to see the evidence of early human civilisation, through cave paintings for example; no one knows the connection between this and language. Brains didn't suddenly get bigger, yet humans did become more complex and more intelligent. Was it using language that caused their brains to develop? Or did their more complex brains start producing language?

        <strong>E</strong>

        More questions lie in looking at the influence of genetics on brain and language development. Are there genes that mutated and gave us language ability? Researchers have found a gene mutation that occurred between 200,000 and 100,000 years ago, which seems to have a connection with speaking and how our brains control our mouths and face. Monkeys have a similar gene, but it did not undergo this mutation. It's too early to say how much influence genes have on language, but one day the answers might be found in our DNA.
        `,
      question: [
        {
          id: 'E1_R2_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. Experts fully understand how the Hindi language developed.
          `,
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
        {
          id: 'E1_R2_Q2',
          label: '2. The grammar of dolphin language follows the same rules as human language.',
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
        {
          id: 'E1_R2_Q3',
          label: '3. Brain size is not the only factor in determining language capability.',
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
        {
          id: 'E1_R2_Q4',
          label: '4. The language of very young children has something in common with the way our prehistoric ancestors may have spoken.',
          type: 'multiple-choice',
          choice: ["True", "False"],
          required: true
        },
      ]
    },
    {
      id: '4',
      label: 'The state of the world',
      description: `
      If your view of the world comes from watching the news and reading newspapers, you could be forgiven for lying awake at night worrying about the future. Apparently, rising violence and population rates mean humans are both killing each other in ever larger numbers and being born at rates the world's resources can't sustain. To make matters worse, all the wealth is concentrated on a handful of people in the world's richest countries. People in low-income countries live in poverty while the West gets richer. Depressing, isn't it?

      But do the statistics support our negative world view or is the world actually improving?

      Let's take global population first. It's around 7 billion now, in line with figures predicted by the UN in 1958. By the year 2100, the same experts predict it will be around 11 billion. But did you know that 11 billion is probably as high as that number will get? The rate of increase will slow down in the second half of this century thanks to falling birth rates today.

      Falling birth rates? Yes, that's right.

      In the last two centuries, improvements in technology and health meant fewer children died young, fuelling rapid population growth. These large families produced even more children who survived into adulthood and had their own children. But with the wider availability of contraception in the 1960s, the global average number of babies per woman has declined from six babies per woman to as low as two.

      The biggest factor in child mortality is poverty. And while it's still true that only 20 per cent of the world takes about 74 per cent of the world's income, 60 per cent of the world now falls into a middle-income group, with 11.6 per cent – the smallest amount of people in history – still living in conditions of extreme poverty. If the majority of the world's people have money, international aid could realistically achieve the UN target of eradicating poverty by 2030. As poverty goes down, life expectancy goes up, birth rates go down because parents can expect their existing children to survive, and the global population stabilises.

      As for news stories that make us think the world is an increasingly violent place, there is cause for some optimism too. Between the end of World War II and 1990, there were 30 wars that killed more than 100,000 people. Today there are still civil wars, but countries are mostly co-existing more peacefully than in the past. However, terrorism has shot up in the last few years and, since World War II, wars have killed many more civilians than soldiers. Even for civilians, though, the statistics are not all bad. Although deaths are nine times more likely to be a result of violent crime than political conflict, the global murder rate fell slightly, from 8 per 100,000 people in 2000 to about 5.3 in 2015.

      Of course, none of this means the world is perfect, and whether you personally are affected by war and poverty is often down to the lottery of where you're born. Also, we still face huge problems of our own making, particularly environmental ones like global warming, and wealth and natural resources need to be distributed more fairly. But not all the news is bad news, whatever the TV and newspapers might say.
      `,
      question: [
        {
          id: 'E1_R3_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. What does the word 'apparently' in the first paragraph tell us about the rise in violence we see in the news?
          `,
          type: 'multiple-choice',
          choice: ["The rise is obviously true", "The rise seems true but evidence might show it isn't", "The rise seems false but evidence might show it's true"],
          required: true
        },
        {
          id: 'E1_R3_Q2',
          label: '2. Which statement about population levels is correct?',
          type: 'multiple-choice',
          choice: ["About two hundred years ago, the child mortality rate started to drop significantly", "The rate is growing steadily now", "The rate will start to drop in the year 2100"],
          required: true
        },
        {
          id: 'E1_R3_Q3',
          label: '3. Which factor does NOT cause the birth rate to fall?',
          type: 'multiple-choice',
          choice: ["Improvements in healthcare", "The availability of contraception", "Poverty"],
          required: true
        },
        {
          id: 'E1_R3_Q4',
          label: "4. One of the UN's targets for 2030 is to ...",
          type: 'multiple-choice',
          choice: ["end poverty", "increase life expectancy", "make population levels stable"],
          required: true
        },
      ]
    },
    {
      id: '5',
      label: 'IMI Questions',
      description: `
      `,
      question: [
        {
          id: 'E1_IMI_Q1',
          label: `<strong>Answer the following questions:</strong>`,
          type: 'likert-group',
          likertRows: [
            { id: 'E1_IMI_Q1', label: "1. While I was reading this material, I was thinking about how much I enjoyed it." },
            { id: 'E1_IMI_Q2', label: "2. I did not feel at all nervous while reading." },
            { id: 'E1_IMI_Q3', label: "3. This material did not hold my attention at all." },
            { id: 'E1_IMI_Q4', label: "4. I think I understood this material pretty well." },
            { id: 'E1_IMI_Q5', label: "5. I would describe this material as very interesting." },
            { id: 'E1_IMI_Q6', label: "6. I think I understood this material very well, compared to other students." },
            { id: 'E1_IMI_Q7', label: "7. I enjoyed reading this material very much." },
            { id: 'E1_IMI_Q8', label: "8. I felt very tense while reading this material." },
            { id: 'E1_IMI_Q9', label: "9. This material was fun to read." }
          ],
          required: true
        },
      ]
    },
  ],

  3: [
    {
      id: '1',
      label: 'Instructions',
      description: 'Group 3/4 instructions here...',
      question: []
    },
    {
      id: '2',
      label: 'Cultural behaviour in business',
      description: `
        Much of today's business is conducted across international borders, and while the majority of the global business community might share the use of English as a common language, the nuances and expectations of business communication might differ greatly from culture to culture. A lack of understanding of the cultural norms and practices of our business acquaintances can result in unfair judgements, misunderstandings and breakdowns in communication. Here are three basic areas of differences in the business etiquette around the world that could help stand you in good stead when you next find yourself working with someone from a different culture.

        <strong>Addressing someone</strong>

        When discussing this topic in a training course, a German trainee and a British trainee got into a hot debate about whether it was appropriate for someone with a doctorate to use the corresponding title on their business card. The British trainee maintained that anyone who wasn't a medical doctor expecting to be addressed as 'Dr' was disgustingly pompous and full of themselves. The German trainee, however, argued that the hard work and years of education put into earning that PhD should give them full rights to expect to be addressed as 'Dr'.

        This stark difference in opinion over something that could be conceived as minor and thus easily overlooked goes to show that we often attach meaning to even the most mundane practices. When things that we are used to are done differently, it could spark the strongest reactions in us. While many Continental Europeans and Latin Americans prefer to be addressed with a title, for example Mr or Ms and their surname when meeting someone in a business context for the first time, Americans, and increasingly the British, now tend to prefer using their first names. The best thing to do is to listen and observe how your conversation partner addresses you and, if you are still unsure, do not be afraid to ask them how they would like to be addressed.

        <strong>Smiling</strong>

        A so-called 'smile of respect' is seen as insincere and often regarded with suspicion in Russia. A famous Russian proverb even states that 'laughing without reason is a sign of idiocy'. Yet in countries like the United States, Australia and Britain, smiling is often interpreted as a sign of openness, friendship and respect, and is frequently used to break the ice.

        In a piece of research done on smiles across cultures, the researchers found that smiling individuals were considered more intelligent than non-smiling people in countries such as Germany, Switzerland, China and Malaysia. However, in countries like Russia, Japan, South Korea and Iran, pictures of smiling faces were rated as less intelligent than the non-smiling ones. Meanwhile, in countries like India, Argentina and the Maldives, smiling was associated with dishonesty.

        <strong>Eye contact</strong>

        An American or British person might be looking their client in the eye to show that they are paying full attention to what is being said, but if that client is from Japan or Korea, they might find the direct eye contact awkward or even disrespectful. In parts of South America and Africa, prolonged eye contact could also be seen as challenging authority. In the Middle East, eye contact across genders is considered inappropriate, although eye contact within a gender could signify honesty and truthfulness.

        Having an increased awareness of the possible differences in expectations and behaviour can help us avoid cases of miscommunication, but it is vital that we also remember that cultural stereotypes can be detrimental to building good business relationships. Although national cultures could play a part in shaping the way we behave and think, we are also largely influenced by the region we come from, the communities we associate with, our age and gender, our corporate culture and our individual experiences of the world. The knowledge of the potential differences should therefore be something we keep at the back of our minds, rather than something that we use to pigeonhole the individuals of an entire nation.
        `,
      question: [
        {
          id: 'E1_R1_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. The British trainee felt that the people who want to be addressed as 'Dr' must be …
          `,
          type: 'multiple-choice',
          choice: ["hard-working", "conceited and self-important", "doing a medical degree", "from Germany"],
          required: true
        },
        {
          id: 'E1_R1_Q2',
          label: '2. If you are not sure how to address someone, you should …',
          type: 'multiple-choice',
          choice: ["use the title you see on their business card", "make your decision based on cultural stereotypes about their country", "address them the way you'd like to be addressed", "ask them what they would like you to call them"],
          required: true
        },
        {
          id: 'E1_R1_Q3',
          label: '3. There might be a misunderstanding if an American smiles at a Russian business associate because the Russian might think that the American is ...',
          type: 'multiple-choice',
          choice: ["being fake", "challenging their authority", "trying to break the ice", "disrespectful"],
          required: true
        },
        {
          id: 'E1_R1_Q4',
          label: '4. The Japanese, South Koreans and Iranians might interpret a smiling face as being …',
          type: 'multiple-choice',
          choice: ["friendlier", "less open", "not as inteligent", "dishonest"],
          required: true
        },
      ]
    },
    {
      id: '3',
      label: 'A biography of Kilian Jornet',
      description: `
      When you picture mountain climbers scaling Mount Everest, what probably comes to mind are teams of climbers with Sherpa guides leading them to the summit, equipped with oxygen masks, supplies and tents. And in most cases you'd be right, as 97 per cent of climbers use oxygen to ascend to Everest's summit at 8,850 metres above sea level. The thin air at high altitudes makes most people breathless at 3,500 metres, and the vast majority of climbers use oxygen past 7,000 metres. A typical climbing group will have 8–15 people in it, with an almost equal number of guides, and they'll spend weeks to get to the top after reaching Base Camp.

      But ultra-distance and mountain runner Kilian Jornet Burgada ascended the mountain in May 2017 alone, without an oxygen mask or fixed ropes for climbing.

      Oh, and he did it in 26 hours.

      With food poisoning.

      And then, five days later, he did it again, this time in only 17 hours.

      Born in 1987, Kilian has been training for Everest his whole life. And that really does mean his whole life, as he grew up 2,000 metres above sea level in the Pyrenees in the ski resort of Lles de Cerdanya in Catalonia, north-eastern Spain. While other children his age were learning to walk, Kilian was on skis. At one and a half years old he did a five-hour hike with his mother, entirely under his own steam. He left his peers even further behind when he climbed his first mountain and competed in his first cross-country ski race at age three. By age seven, he had scaled a 4,000er and, at ten, he did a 42-day crossing of the Pyrenees.

      He was 13 when he says he started to take it 'seriously' and trained with the Ski Mountaineering Technical Centre (CTEMC) in Catalonia, entering competitions and working with a coach. At 18, he took over his own ski-mountaineering and trail-running training, with a schedule that only allows a couple of weeks of rest a year. He does as many as 1,140 hours of endurance training a year, plus strength training and technical workouts as well as specific training in the week before a race. For his record-breaking ascent and descent of the Matterhorn, he prepared by climbing the mountain ten times until he knew every detail of it, even including where the sun would be shining at every part of the day.

      Sleeping only seven hours a night, Kilian Jornet seems almost superhuman. His resting heartbeat is extremely low at 33 beats per minute, compared with the average man's 60 per minute or an athlete's 40 per minute. He breathes more efficiently than average people too, taking in more oxygen per breath, and he has a much faster recovery time after exercise as his body quickly breaks down lactic acid – the acid in muscles that causes pain after exercise.

      All this is thanks to his childhood in the mountains and to genetics, but it is his mental strength that sets him apart. He often sets himself challenges to see how long he can endure difficult conditions in order to truly understand what his body and mind can cope with. For example, he almost gave himself kidney failure after only drinking 3.5 litres of water on a 100km run in temperatures of around 40°C.

      It would take a book to list all the races and awards he's won and the mountains he's climbed. And even here, Kilian’s achievements exceed the average person as, somehow, he finds time to record his career on his blog and has written three books, Run or Die, The Invisible Border and Summits of My Life.
      `,
      question: [
        {
          id: 'E1_R2_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. The majority of climbers on Everest …
          `,
          type: 'multiple-choice',
          choice: ["need oxygen to finish their ascent", "are accompanied", "make slow progress to the top", "all of the above"],
          required: true
        },
        {
          id: 'E1_R2_Q2',
          label: '2. Kilian Jornet is unlike most Everest climbers because …',
          type: 'multiple-choice',
          choice: ["he is a professional climber", "he ascended faster", "he found the climb difficult", "all of the above"],
          required: true
        },
        {
          id: 'E1_R2_Q3',
          label: '3. In his training now, Kilian …',
          type: 'multiple-choice',
          choice: ["demands a lot of himself", "takes a lot of rest periods", "uses a coach", "none of the above"],
          required: true
        },
        {
          id: 'E1_R2_Q4',
          label: '4. Kilian partly owes his incredible fitness to …',
          type: 'multiple-choice',
          choice: ["the way he makes extra time for sleep", "his ability to recover from injury", "where he grew up", "all of the above"],
          required: true
        },
      ]
    },
    {
      id: '4',
      label: 'Life on Mars',
      description: `
      A new study published in the journal Science shows definitive evidence of organic matter on the surface of Mars. The data was collected by NASA's nuclear-powered rover Curiosity. It confirms earlier findings that the Red Planet once contained carbon-based compounds. These compounds – also called organic molecules – are essential ingredients for life as scientists understand it.

      The organic molecules were found in Mars's Gale Crater, a large area that may have been a watery lake over three billion years ago. The rover encountered traces of the molecule in rocks extracted from the area. The rocks also contain sulfur, which scientists speculate helped preserve the organics even when the rocks were exposed to the harsh radiation on the surface of the planet.

      Scientists are quick to state that the presence of these organic molecules is not sufficient evidence for ancient life on Mars, as the molecules could have been formed by non-living processes. But it's still one of the most astonishing discoveries, which could lead to future revelations. Especially when one considers the other startling find that Curiosity uncovered around five years ago.

      The rover analyses the air around it periodically, and in 2014 it found the air contained another of the most basic organic molecules and a key ingredient of natural gas: methane. One of the characteristics of methane is that it only survives a few hundred years. This means that something, somewhere on Mars, is replenishing the supply. According to NASA, Mars emits thousands of tons of methane at a time. The level of methane rises and falls at seasonal intervals in the year, almost as if the planet is breathing it.

      NASA suspects the methane comes from deep under the surface of the planet. The variations in temperature on the surface of Mars cause the molecule to flow upwards at higher or lower levels. For example, in the Martian winter the gas could get trapped in underground icy crystals. These crystals, called clathrates, melt in the summer and release the gas. However, the source of the methane is still a complete mystery.

      The world of astrobiology considers both of these studies as historical milestones. According to this information, Mars is not a dead planet. On the contrary, it is quite active and may be changing and becoming more habitable.

      Of course, this means further research is necessary. Scientists say they need to send new equipment to Mars, equipment that can measure the air and soil with more precision. There are already missions underway. The European Space Agency's ExoMars ship lands in 2020 and will be able to drill into the ground on Mars to analyse what it finds. Additionally, NASA is sending another Mars Rover in the same year to collect samples of Martian soil and return them to Earth.

      The possibility of life on Mars has fascinated humans for generations. It has been the subject of endless science-fiction novels and films. Are we alone in the universe or have there been other life forms within our Solar System? If the current missions to the Red Planet continue, it looks as if we may discover the answer very soon.
    `,
      question: [
        {
          id: 'E1_R3_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. The study in the journal 'Science' was written by NASA scientists.
          `,
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        },
        {
          id: 'E1_R3_Q2',
          label: '2. This is not the first study to suggest that life existed on Mars in the past.',
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        },
        {
          id: 'E1_R3_Q3',
          label: '3. A scientific vehicle found very small elements of an organic molecule within water extracted from the planet.',
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        },
        {
          id: 'E1_R3_Q4',
          label: '4. It is believed that this conclusively proves that there was once life on the planet.',
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        }
      ]
    },
    {
      id: '5',
      label: 'IMI Questions',
      description: `
      `,
      question: [
        {
          id: 'E1_IMI_Q1',
          label: `<strong>Answer the following questions:</strong>`,
          type: 'likert-group',
          likertRows: [
            { id: 'E1_IMI_Q1', label: "1. While I was reading this material, I was thinking about how much I enjoyed it." },
            { id: 'E1_IMI_Q2', label: "2. I did not feel at all nervous while reading." },
            { id: 'E1_IMI_Q3', label: "3. This material did not hold my attention at all." },
            { id: 'E1_IMI_Q4', label: "4. I think I understood this material pretty well." },
            { id: 'E1_IMI_Q5', label: "5. I would describe this material as very interesting." },
            { id: 'E1_IMI_Q6', label: "6. I think I understood this material very well, compared to other students." },
            { id: 'E1_IMI_Q7', label: "7. I enjoyed reading this material very much." },
            { id: 'E1_IMI_Q8', label: "8. I felt very tense while reading this material." },
            { id: 'E1_IMI_Q9', label: "9. This material was fun to read." }
          ],
          required: true
        },
      ]
    },
  ],

  4: [
    {
      id: '1',
      label: 'Instructions',
      description: 'Group 3/4 instructions here...',
      question: []
    },
    {
      id: '2',
      label: 'Cultural behaviour in business',
      description: `
        Much of today's business is conducted across international borders, and while the majority of the global business community might share the use of English as a common language, the nuances and expectations of business communication might differ greatly from culture to culture. A lack of understanding of the cultural norms and practices of our business acquaintances can result in unfair judgements, misunderstandings and breakdowns in communication. Here are three basic areas of differences in the business etiquette around the world that could help stand you in good stead when you next find yourself working with someone from a different culture.

        <strong>Addressing someone</strong>

        When discussing this topic in a training course, a German trainee and a British trainee got into a hot debate about whether it was appropriate for someone with a doctorate to use the corresponding title on their business card. The British trainee maintained that anyone who wasn't a medical doctor expecting to be addressed as 'Dr' was disgustingly pompous and full of themselves. The German trainee, however, argued that the hard work and years of education put into earning that PhD should give them full rights to expect to be addressed as 'Dr'.

        This stark difference in opinion over something that could be conceived as minor and thus easily overlooked goes to show that we often attach meaning to even the most mundane practices. When things that we are used to are done differently, it could spark the strongest reactions in us. While many Continental Europeans and Latin Americans prefer to be addressed with a title, for example Mr or Ms and their surname when meeting someone in a business context for the first time, Americans, and increasingly the British, now tend to prefer using their first names. The best thing to do is to listen and observe how your conversation partner addresses you and, if you are still unsure, do not be afraid to ask them how they would like to be addressed.

        <strong>Smiling</strong>

        A so-called 'smile of respect' is seen as insincere and often regarded with suspicion in Russia. A famous Russian proverb even states that 'laughing without reason is a sign of idiocy'. Yet in countries like the United States, Australia and Britain, smiling is often interpreted as a sign of openness, friendship and respect, and is frequently used to break the ice.

        In a piece of research done on smiles across cultures, the researchers found that smiling individuals were considered more intelligent than non-smiling people in countries such as Germany, Switzerland, China and Malaysia. However, in countries like Russia, Japan, South Korea and Iran, pictures of smiling faces were rated as less intelligent than the non-smiling ones. Meanwhile, in countries like India, Argentina and the Maldives, smiling was associated with dishonesty.

        <strong>Eye contact</strong>

        An American or British person might be looking their client in the eye to show that they are paying full attention to what is being said, but if that client is from Japan or Korea, they might find the direct eye contact awkward or even disrespectful. In parts of South America and Africa, prolonged eye contact could also be seen as challenging authority. In the Middle East, eye contact across genders is considered inappropriate, although eye contact within a gender could signify honesty and truthfulness.

        Having an increased awareness of the possible differences in expectations and behaviour can help us avoid cases of miscommunication, but it is vital that we also remember that cultural stereotypes can be detrimental to building good business relationships. Although national cultures could play a part in shaping the way we behave and think, we are also largely influenced by the region we come from, the communities we associate with, our age and gender, our corporate culture and our individual experiences of the world. The knowledge of the potential differences should therefore be something we keep at the back of our minds, rather than something that we use to pigeonhole the individuals of an entire nation.
        `,
      question: [
        {
          id: 'E1_R1_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. The British trainee felt that the people who want to be addressed as 'Dr' must be …
          `,
          type: 'multiple-choice',
          choice: ["hard-working", "conceited and self-important", "doing a medical degree", "from Germany"],
          required: true
        },
        {
          id: 'E1_R1_Q2',
          label: '2. If you are not sure how to address someone, you should …',
          type: 'multiple-choice',
          choice: ["use the title you see on their business card", "make your decision based on cultural stereotypes about their country", "address them the way you'd like to be addressed", "ask them what they would like you to call them"],
          required: true
        },
        {
          id: 'E1_R1_Q3',
          label: '3. There might be a misunderstanding if an American smiles at a Russian business associate because the Russian might think that the American is ...',
          type: 'multiple-choice',
          choice: ["being fake", "challenging their authority", "trying to break the ice", "disrespectful"],
          required: true
        },
        {
          id: 'E1_R1_Q4',
          label: '4. The Japanese, South Koreans and Iranians might interpret a smiling face as being …',
          type: 'multiple-choice',
          choice: ["friendlier", "less open", "not as inteligent", "dishonest"],
          required: true
        },
      ]
    },
    {
      id: '3',
      label: 'A biography of Kilian Jornet',
      description: `
      When you picture mountain climbers scaling Mount Everest, what probably comes to mind are teams of climbers with Sherpa guides leading them to the summit, equipped with oxygen masks, supplies and tents. And in most cases you'd be right, as 97 per cent of climbers use oxygen to ascend to Everest's summit at 8,850 metres above sea level. The thin air at high altitudes makes most people breathless at 3,500 metres, and the vast majority of climbers use oxygen past 7,000 metres. A typical climbing group will have 8–15 people in it, with an almost equal number of guides, and they'll spend weeks to get to the top after reaching Base Camp.

      But ultra-distance and mountain runner Kilian Jornet Burgada ascended the mountain in May 2017 alone, without an oxygen mask or fixed ropes for climbing.

      Oh, and he did it in 26 hours.

      With food poisoning.

      And then, five days later, he did it again, this time in only 17 hours.

      Born in 1987, Kilian has been training for Everest his whole life. And that really does mean his whole life, as he grew up 2,000 metres above sea level in the Pyrenees in the ski resort of Lles de Cerdanya in Catalonia, north-eastern Spain. While other children his age were learning to walk, Kilian was on skis. At one and a half years old he did a five-hour hike with his mother, entirely under his own steam. He left his peers even further behind when he climbed his first mountain and competed in his first cross-country ski race at age three. By age seven, he had scaled a 4,000er and, at ten, he did a 42-day crossing of the Pyrenees.

      He was 13 when he says he started to take it 'seriously' and trained with the Ski Mountaineering Technical Centre (CTEMC) in Catalonia, entering competitions and working with a coach. At 18, he took over his own ski-mountaineering and trail-running training, with a schedule that only allows a couple of weeks of rest a year. He does as many as 1,140 hours of endurance training a year, plus strength training and technical workouts as well as specific training in the week before a race. For his record-breaking ascent and descent of the Matterhorn, he prepared by climbing the mountain ten times until he knew every detail of it, even including where the sun would be shining at every part of the day.

      Sleeping only seven hours a night, Kilian Jornet seems almost superhuman. His resting heartbeat is extremely low at 33 beats per minute, compared with the average man's 60 per minute or an athlete's 40 per minute. He breathes more efficiently than average people too, taking in more oxygen per breath, and he has a much faster recovery time after exercise as his body quickly breaks down lactic acid – the acid in muscles that causes pain after exercise.

      All this is thanks to his childhood in the mountains and to genetics, but it is his mental strength that sets him apart. He often sets himself challenges to see how long he can endure difficult conditions in order to truly understand what his body and mind can cope with. For example, he almost gave himself kidney failure after only drinking 3.5 litres of water on a 100km run in temperatures of around 40°C.

      It would take a book to list all the races and awards he's won and the mountains he's climbed. And even here, Kilian’s achievements exceed the average person as, somehow, he finds time to record his career on his blog and has written three books, Run or Die, The Invisible Border and Summits of My Life.
      `,
      question: [
        {
          id: 'E1_R2_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. The majority of climbers on Everest …
          `,
          type: 'multiple-choice',
          choice: ["need oxygen to finish their ascent", "are accompanied", "make slow progress to the top", "all of the above"],
          required: true
        },
        {
          id: 'E1_R2_Q2',
          label: '2. Kilian Jornet is unlike most Everest climbers because …',
          type: 'multiple-choice',
          choice: ["he is a professional climber", "he ascended faster", "he found the climb difficult", "all of the above"],
          required: true
        },
        {
          id: 'E1_R2_Q3',
          label: '3. In his training now, Kilian …',
          type: 'multiple-choice',
          choice: ["demands a lot of himself", "takes a lot of rest periods", "uses a coach", "none of the above"],
          required: true
        },
        {
          id: 'E1_R2_Q4',
          label: '4. Kilian partly owes his incredible fitness to …',
          type: 'multiple-choice',
          choice: ["the way he makes extra time for sleep", "his ability to recover from injury", "where he grew up", "all of the above"],
          required: true
        },
      ]
    },
    {
      id: '4',
      label: 'Life on Mars',
      description: `
      A new study published in the journal Science shows definitive evidence of organic matter on the surface of Mars. The data was collected by NASA's nuclear-powered rover Curiosity. It confirms earlier findings that the Red Planet once contained carbon-based compounds. These compounds – also called organic molecules – are essential ingredients for life as scientists understand it.

      The organic molecules were found in Mars's Gale Crater, a large area that may have been a watery lake over three billion years ago. The rover encountered traces of the molecule in rocks extracted from the area. The rocks also contain sulfur, which scientists speculate helped preserve the organics even when the rocks were exposed to the harsh radiation on the surface of the planet.

      Scientists are quick to state that the presence of these organic molecules is not sufficient evidence for ancient life on Mars, as the molecules could have been formed by non-living processes. But it's still one of the most astonishing discoveries, which could lead to future revelations. Especially when one considers the other startling find that Curiosity uncovered around five years ago.

      The rover analyses the air around it periodically, and in 2014 it found the air contained another of the most basic organic molecules and a key ingredient of natural gas: methane. One of the characteristics of methane is that it only survives a few hundred years. This means that something, somewhere on Mars, is replenishing the supply. According to NASA, Mars emits thousands of tons of methane at a time. The level of methane rises and falls at seasonal intervals in the year, almost as if the planet is breathing it.

      NASA suspects the methane comes from deep under the surface of the planet. The variations in temperature on the surface of Mars cause the molecule to flow upwards at higher or lower levels. For example, in the Martian winter the gas could get trapped in underground icy crystals. These crystals, called clathrates, melt in the summer and release the gas. However, the source of the methane is still a complete mystery.

      The world of astrobiology considers both of these studies as historical milestones. According to this information, Mars is not a dead planet. On the contrary, it is quite active and may be changing and becoming more habitable.

      Of course, this means further research is necessary. Scientists say they need to send new equipment to Mars, equipment that can measure the air and soil with more precision. There are already missions underway. The European Space Agency's ExoMars ship lands in 2020 and will be able to drill into the ground on Mars to analyse what it finds. Additionally, NASA is sending another Mars Rover in the same year to collect samples of Martian soil and return them to Earth.

      The possibility of life on Mars has fascinated humans for generations. It has been the subject of endless science-fiction novels and films. Are we alone in the universe or have there been other life forms within our Solar System? If the current missions to the Red Planet continue, it looks as if we may discover the answer very soon.
    `,
      question: [
        {
          id: 'E1_R3_Q1',
          label: `
          <strong>Answer the following questions:</strong>

          1. The study in the journal 'Science' was written by NASA scientists.
          `,
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        },
        {
          id: 'E1_R3_Q2',
          label: '2. This is not the first study to suggest that life existed on Mars in the past.',
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        },
        {
          id: 'E1_R3_Q3',
          label: '3. A scientific vehicle found very small elements of an organic molecule within water extracted from the planet.',
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        },
        {
          id: 'E1_R3_Q4',
          label: '4. It is believed that this conclusively proves that there was once life on the planet.',
          type: 'multiple-choice',
          choice: ["True", "False", "Not Given"],
          required: true
        }
      ]
    },
    {
      id: '5',
      label: 'IMI Questions',
      description: `
      `,
      question: [
        {
          id: 'E1_IMI_Q1',
          label: `<strong>Answer the following questions:</strong>`,
          type: 'likert-group',
          likertRows: [
            { id: 'E1_IMI_Q1', label: "1. While I was reading this material, I was thinking about how much I enjoyed it." },
            { id: 'E1_IMI_Q2', label: "2. I did not feel at all nervous while reading." },
            { id: 'E1_IMI_Q3', label: "3. This material did not hold my attention at all." },
            { id: 'E1_IMI_Q4', label: "4. I think I understood this material pretty well." },
            { id: 'E1_IMI_Q5', label: "5. I would describe this material as very interesting." },
            { id: 'E1_IMI_Q6', label: "6. I think I understood this material very well, compared to other students." },
            { id: 'E1_IMI_Q7', label: "7. I enjoyed reading this material very much." },
            { id: 'E1_IMI_Q8', label: "8. I felt very tense while reading this material." },
            { id: 'E1_IMI_Q9', label: "9. This material was fun to read." }
          ],
          required: true
        },
      ]
    },
  ],
};
