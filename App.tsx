import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GrammarSection from './components/GrammarSection';
import QuizFlow from './components/QuizFlow';
import ParticleBackground from './components/ParticleBackground';
import Settings from './components/Settings';
import AiChatbot from './components/AiChatbot';
import Dashboard from './components/Dashboard';
import Store from './components/Store';
import Profile from './components/Profile';
import { 
    GRAMMAR_TOPICS_AR, QUIZ_SETS_AR, STORE_ITEMS, ACHIEVEMENTS,
    GRAMMAR_TOPICS_FR, QUIZ_SETS_FR,
    GRAMMAR_TOPICS_EN, QUIZ_SETS_EN
} from './constants';
import type { QuizSet, QuizQuestion, GrammarTopic, UserProgress, StoreItem, Achievement } from './types';

type View = 'dashboard' | 'lesson' | 'quiz' | 'store' | 'settings' | 'profile';
type Sound = 'correct' | 'incorrect' | 'level-up' | 'purchase' | 'achievement';
type Language = 'ar' | 'fr' | 'en';
type VisualEffect = 'rainbow' | 'grayscale' | 'correct-answer' | 'incorrect-answer' | null;

const ICONS: Record<Exclude<View, 'lesson'>, React.ReactNode> = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    quiz: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3,2.268a2,2,0,0,0-2.6,0l-6,5.25A2,2,0,0,0,2,9.25v6.5a2,2,0,0,0,2,2h12a2,2,0,0,0,2-2v-6.5a2,2,0,0,0-0.7-1.732l-6-5.25ZM10,4.5l6,5.25v6.5H4v-6.5L10,4.5ZM9,11v4h2v-4H9Zm0-3h2v2H9V8Z" clipRule="evenodd" /></svg>,
    store: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l.237-.237.954-3.818.008-.032.01-.041L9.4 3H15a1 1 0 000-2H3zM6 16a2 2 0 100 4 2 2 0 000-4zm9-2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    profile: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379-1.561-2.6 0-2.978a1.532 1.532 0 01.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
};

const translations = {
    ar: {
        lang: 'ar',
        dashboard: 'الرئيسية',
        quiz: 'الاختبارات',
        store: 'المتجر',
        profile: 'الملف الشخصي',
        settings: 'الإعدادات',
        title: 'موسوعة النحو المبسط',
        dashboardTitle: 'اختر درسًا لتبدأ رحلتك',
        dashboardProgress: 'التقدم',
        dashboardLevels: 'مستويات',
        quizTitle: 'اختبر فهمك',
        checkAnswers: 'تحقق من الإجابات',
        retryQuiz: 'أعد المحاولة',
        quizCorrect: 'إجابات صحيحة! أحسنت!',
        incorrectAnswerTitle: 'إجابة خاطئة',
        masteryTitle: 'إتقان تام!',
        masteryDescription: 'لقد أتقنت درس "{topicTitle}". عمل رائع!',
        continueLearning: 'متابعة التعلم',
        backToLessons: 'العودة للدروس',
        lessonLevels: 'مستويات الدرس',
        examplesTitle: 'أمثلة توضيحية',
        explanation: 'التوضيح',
        level: 'المستوى',
        levelPassed: 'المستوى مكتمل! +{xp} XP 🎉',
        allTopicsFilter: 'كل الدروس',
        correctAnswer: 'إجابة صحيحة!',
        incorrectAnswer: 'إجابة خاطئة. الصحيحة هي:',
        quizResult100: 'ممتاز!',
        quizResult80: 'رائع!',
        quizResult60: 'جيد جداً!',
        quizResult40: 'يمكنك أفضل!',
        quizResult0: 'استمر بالمحاولة!',
        yourFinalScore: 'نتيجتك النهائية',
        youEarnedXP: 'لقد كسبت {xp} XP',
        backToMenu: 'العودة للقائمة',
        retakeQuiz: 'إعادة الاختبار',
        question: 'سؤال',
        quizYourself: 'اختبر نفسك',
        quizSelectionTitle: 'اختر اختبارًا',
        quizSelectionBack: 'العودة لاختيار الاختبار',
        quizQuestionCount: 'اختر عدد الأسئلة لبدء الاختبار.',
        questionsLabel: 'أسئلة',
        quizNotEnoughQuestions: 'لا توجد أسئلة كافية لهذا الموضوع حاليًا.',
        settingsDescription: 'تحكم في تفضيلاتك وبيانات التطبيق.',
        appearance: 'المظهر',
        lightMode: 'الوضع الفاتح',
        resetTheme: 'إعادة تعيين الثيم',
        dataManagement: 'إدارة البيانات',
        dataWarning: 'تحذير: هذا الإجراء سيحذف كل تقدمك ومشترياتك بشكل دائم ولا يمكن التراجع عنه.',
        deleteAllData: 'حذف كل البيانات',
        resetModalTitle: 'هل أنت متأكد؟',
        resetModalDescription: 'سيتم حذف <strong>كل</strong> بياناتك بشكل نهائي. هذا يشمل نقاط الخبرة، والمستويات المكتملة، والمشتريات، والإنجازات.',
        resetModalChallenge: 'للتأكيد، حل المعادلة التالية:',
        resetModalPlaceholder: 'أدخل قيمة x',
        resetModalCancel: 'إلغاء',
        resetModalConfirm: 'نعم، احذف كل شيء',
        aiGreeting: 'أهلاً بك! أنا نحوي، مساعدك في النحو العربي. كيف يمكنني مساعدتك اليوم؟',
        aiError: 'عذرًا، حدث خطأ أثناء الاتصال بالمساعد. يرجى المحاولة مرة أخرى.',
        sendMessage: 'أرسل رسالة',
        aiThinking: 'يفكر...',
        profileDescription: 'نظرة عامة على تقدمك وإنجازاتك.',
        profileStats: 'إحصائيات التقدم',
        profileXP: 'نقاط الخبرة (XP):',
        profileLevels: 'المستويات المكتملة:',
        profileTotalProgress: 'إجمالي التقدم',
        profileAchievements: 'الإنجازات المحققة',
        profileNoAchievements: 'لم تحقق أي إنجازات بعد. استمر في التعلم!',
        storeTitle: 'متجر المكافآت',
        storeDescription: 'استخدم نقاط الخبرة (XP) لشراء أوسمة وثيمات مميزة!',
        storeBadges: 'الأوسمة',
        storeThemes: 'الثيمات',
        storePreview: 'استعراض',
        storeThemeActive: 'الثيم النشط',
        storeThemeActivate: 'تفعيل الثيم',
        storePurchased: 'تم الشراء',
        storePurchase: 'شراء',
        badge_bronze_name: 'وسام نحوي برونزي',
        badge_bronze_desc: 'يضاعف كل نقاط الخبرة المكتسبة بمقدار 1.15x',
        badge_silver_name: 'وسام نحوي فضي',
        badge_silver_desc: 'يضاعف كل نقاط الخبرة المكتسبة بمقدار 1.25x',
        badge_gold_name: 'وسام نحوي ذهبي',
        badge_gold_desc: 'يضاعف كل نقاط الخبرة المكتسبة بمقدار 1.40x',
        badge_expert_name: 'شارة الخبير النحوي',
        badge_expert_desc: 'أعلى تكريم، يضاعف نقاط الخبرة بمقدار 1.60x',
        badge_book_name: 'شارة عاشق الكتب',
        badge_book_desc: 'يضيف +0.05 إلى مضاعف نقاط الخبرة الحالي لديك.',
        badge_star_name: 'نجمة التفوق',
        badge_star_desc: 'يضيف +0.05 إلى مضاعف نقاط الخبرة الحالي لديك.',
        theme_ocean_name: 'ثيم نسيم المحيط',
        theme_ocean_desc: 'ثيم هادئ بألوان المحيط الزرقاء والتركوازية.',
        theme_sunset_name: 'ثيم شفق الغروب',
        theme_sunset_desc: 'ثيم دافئ بألوان الغروب البرتقالية والحمراء.',
        theme_forest_name: 'ثيم غابة الزمرد',
        theme_forest_desc: 'ثيم مستوحى من الطبيعة بألوان خضراء هادئة.',
        ach_first_level_name: 'الخطوة الأولى',
        ach_first_level_desc: 'أكملت مستواك الأول بنجاح!',
        ach_first_topic_name: 'سيد درس',
        ach_first_topic_desc: 'أتقنت جميع مستويات درس كامل.',
        ach_perfect_quiz_name: 'العلامة الكاملة',
        ach_perfect_quiz_desc: 'حصلت على 100% في اختبار (10 أسئلة أو أكثر).',
        ach_first_purchase_name: 'المتسوق الأول',
        ach_first_purchase_desc: 'اشتريت أول عنصر من المتجر.',
        ach_xp_1000_name: 'خبير صاعد',
        ach_xp_1000_desc: 'وصلت إلى 1000 نقطة خبرة!',
        ach_polyglot_name: 'متعدد اللغات',
        ach_polyglot_desc: 'بدأت رحلتك في تعلم لغة جديدة.',
        ach_streak_3_name: 'متعلم ملتزم',
        ach_streak_3_desc: 'سجلت الدخول لـ 3 أيام متتالية.',
        ach_night_owl_name: 'بومة الليل',
        ach_night_owl_desc: 'درست في وقت متأخر من الليل.',
        ach_early_bird_name: 'الطائر المبكر',
        ach_early_bird_desc: 'بدأت يومك بالتعلم مبكرًا.',
        ach_shopaholic_name: 'مهووس بالتسوق',
        ach_shopaholic_desc: 'اشتريت 3 عناصر من المتجر.',
        ach_theme_collector_name: 'جامع الثيمات',
        ach_theme_collector_desc: 'امتلكت كل الثيمات المتاحة.',
        ach_master_ar_name: 'بروفيسور العربية',
        ach_master_ar_desc: 'أتقنت جميع دروس النحو العربي.',
        ach_master_fr_name: 'Professeur de Français',
        ach_master_fr_desc: 'أتقنت جميع دروس النحو الفرنسي.',
        ach_master_en_name: 'بروفيسور الإنجليزية',
        ach_master_en_desc: 'أتقنت جميع دروس النحو الإنجليزي.',
    },
    fr: {
        lang: 'fr',
        dashboard: 'Accueil',
        quiz: 'Quiz',
        store: 'Boutique',
        profile: 'Profil',
        settings: 'Paramètres',
        title: 'Encyclopédie Grammaticale',
        dashboardTitle: 'Choisissez une leçon pour commencer',
        dashboardProgress: 'Progrès',
        dashboardLevels: 'niveaux',
        quizTitle: 'Testez votre compréhension',
        checkAnswers: 'Vérifier les réponses',
        retryQuiz: 'Réessayer',
        quizCorrect: 'Toutes les réponses sont correctes ! Bravo !',
        incorrectAnswerTitle: 'Mauvaise réponse',
        masteryTitle: 'Maîtrise Totale !',
        masteryDescription: 'Vous avez maîtrisé la leçon "{topicTitle}". Excellent travail !',
        continueLearning: 'Continuer à apprendre',
        backToLessons: 'Retour aux leçons',
        lessonLevels: 'Niveaux de la leçon',
        examplesTitle: 'Exemples',
        explanation: 'Explication',
        level: 'Niveau',
        levelPassed: 'Niveau terminé ! +{xp} XP 🎉',
        allTopicsFilter: 'Toutes les leçons',
        correctAnswer: 'Bonne réponse !',
        incorrectAnswer: 'Mauvaise réponse. La bonne était :',
        quizResult100: 'Parfait !',
        quizResult80: 'Excellent !',
        quizResult60: 'Très bien !',
        quizResult40: 'Vous pouvez mieux faire !',
        quizResult0: 'Continuez d\'essayer !',
        yourFinalScore: 'Votre score final',
        youEarnedXP: 'Vous avez gagné {xp} XP',
        backToMenu: 'Retour au menu',
        retakeQuiz: 'Refaire le quiz',
        question: 'Question',
        quizYourself: 'Testez-vous',
        quizSelectionTitle: 'Choisissez un Quiz',
        quizSelectionBack: 'Retour à la sélection du quiz',
        quizQuestionCount: 'Choisissez le nombre de questions pour commencer.',
        questionsLabel: 'questions',
        quizNotEnoughQuestions: 'Pas assez de questions pour ce sujet pour le moment.',
        settingsDescription: 'Gérez vos préférences et les données de l\'application.',
        appearance: 'Apparence',
        lightMode: 'Mode Clair',
        resetTheme: 'Réinitialiser le thème',
        dataManagement: 'Gestion des données',
        dataWarning: 'Attention : Cette action supprimera définitivement toutes vos données et ne peut être annulée.',
        deleteAllData: 'Tout supprimer',
        resetModalTitle: 'Êtes-vous sûr ?',
        resetModalDescription: '<strong>Toutes</strong> vos données seront supprimées définitivement. Cela inclut vos points d\'expérience, les niveaux terminés, les achats et les succès.',
        resetModalChallenge: 'Pour confirmer, résolvez l\'équation suivante :',
        resetModalPlaceholder: 'Entrez la valeur de x',
        resetModalCancel: 'Annuler',
        resetModalConfirm: 'Oui, tout supprimer',
        aiGreeting: 'Bonjour ! Je suis GrammaireGPT, votre tuteur de grammaire française. Comment puis-je vous aider aujourd\'hui ?',
        aiError: 'Désolé, une erreur s\'est produite lors de la connexion à l\'assistant. Veuillez réessayer.',
        sendMessage: 'Envoyer un message',
        aiThinking: 'Réfléchit...',
        profileDescription: 'Un aperçu de vos progrès et de vos réalisations.',
        profileStats: 'Statistiques de progression',
        profileXP: 'Points d\'expérience (XP) :',
        profileLevels: 'Niveaux terminés :',
        profileTotalProgress: 'Progression totale',
        profileAchievements: 'Succès débloqués',
        profileNoAchievements: 'Aucun succès débloqué pour le moment. Continuez à apprendre !',
        storeTitle: 'Boutique de récompenses',
        storeDescription: 'Utilisez vos points d\'expérience (XP) pour acheter des badges et des thèmes uniques !',
        storeBadges: 'Badges',
        storeThemes: 'Thèmes',
        storePreview: 'Aperçu',
        storeThemeActive: 'Thème Actif',
        storeThemeActivate: 'Activer le Thème',
        storePurchased: 'Acheté',
        storePurchase: 'Acheter',
        badge_bronze_name: 'Badge de Bronze Grammatical',
        badge_bronze_desc: 'Multiplie tous les XP gagnés par 1.15x',
        badge_silver_name: 'Badge d\'Argent Grammatical',
        badge_silver_desc: 'Multiplie tous les XP gagnés par 1.25x',
        badge_gold_name: 'Badge d\'Or Grammatical',
        badge_gold_desc: 'Multiplie tous les XP gagnés par 1.40x',
        badge_expert_name: 'Badge d\'Expert Grammairien',
        badge_expert_desc: 'La plus haute distinction, multiplie les XP par 1.60x',
        badge_book_name: 'Badge Amoureux des Livres',
        badge_book_desc: 'Ajoute +0.05 à votre multiplicateur d\'XP actuel.',
        badge_star_name: 'Étoile d\'Excellence',
        badge_star_desc: 'Ajoute +0.05 à votre multiplicateur d\'XP actuel.',
        theme_ocean_name: 'Thème Brise Océane',
        theme_ocean_desc: 'Un thème apaisant avec des couleurs bleues et turquoises de l\'océan.',
        theme_sunset_name: 'Thème Crépuscule Couchant',
        theme_sunset_desc: 'Un thème chaleureux avec des couleurs orange et rouges du coucher de soleil.',
        theme_forest_name: 'Thème Forêt d\'Émeraude',
        theme_forest_desc: 'Un thème inspiré de la nature avec des couleurs vertes apaisantes.',
        ach_first_level_name: 'Le Premier Pas',
        ach_first_level_desc: 'Vous avez terminé votre premier niveau avec succès !',
        ach_first_topic_name: 'Maître d\'une Leçon',
        ach_first_topic_desc: 'Vous avez maîtrisé tous les niveaux d\'une leçon complète.',
        ach_perfect_quiz_name: 'Score Parfait',
        ach_perfect_quiz_desc: 'Vous avez obtenu 100% à un quiz (10 questions ou plus).',
        ach_first_purchase_name: 'Premier Achat',
        ach_first_purchase_desc: 'Vous avez acheté votre premier article dans la boutique.',
        ach_xp_1000_name: 'Expert en Herbe',
        ach_xp_1000_desc: 'Vous avez atteint 1000 points d\'expérience !',
        ach_polyglot_name: 'Polyglotte',
        ach_polyglot_desc: 'Vous avez commencé votre voyage dans une nouvelle langue.',
        ach_streak_3_name: 'Apprenant Assidu',
        ach_streak_3_desc: 'Connecté pendant 3 jours consécutifs.',
        ach_night_owl_name: 'Oiseau de Nuit',
        ach_night_owl_desc: 'Vous avez étudié tard dans la nuit.',
        ach_early_bird_name: 'Lève-tôt',
        ach_early_bird_desc: 'Vous avez commencé votre journée en apprenant tôt.',
        ach_shopaholic_name: 'Accro au Shopping',
        ach_shopaholic_desc: 'Vous avez acheté 3 articles dans la boutique.',
        ach_theme_collector_name: 'Collectionneur de Thèmes',
        ach_theme_collector_desc: 'Vous possédez tous les thèmes disponibles.',
        ach_master_ar_name: 'Professeur d\'Arabe',
        ach_master_ar_desc: 'Vous avez maîtrisé toutes les leçons de grammaire arabe.',
        ach_master_fr_name: 'Professeur de Français',
        ach_master_fr_desc: 'Vous avez maîtrisé toutes les leçons de grammaire française.',
        ach_master_en_name: 'Professeur d\'Anglais',
        ach_master_en_desc: 'Vous avez maîtrisé toutes les leçons de grammaire anglaise.',
    },
    en: {
        lang: 'en',
        dashboard: 'Home',
        quiz: 'Quizzes',
        store: 'Store',
        profile: 'Profile',
        settings: 'Settings',
        title: 'Grammar Encyclopedia',
        dashboardTitle: 'Choose a lesson to begin your journey',
        dashboardProgress: 'Progress',
        dashboardLevels: 'levels',
        quizTitle: 'Test Your Understanding',
        checkAnswers: 'Check Answers',
        retryQuiz: 'Retry Quiz',
        quizCorrect: 'All answers correct! Well done!',
        incorrectAnswerTitle: 'Incorrect Answer',
        masteryTitle: 'Total Mastery!',
        masteryDescription: 'You have mastered the "{topicTitle}" lesson. Excellent work!',
        continueLearning: 'Continue Learning',
        backToLessons: 'Back to Lessons',
        lessonLevels: 'Lesson Levels',
        examplesTitle: 'Examples',
        explanation: 'Explanation',
        level: 'Level',
        levelPassed: 'Level complete! +{xp} XP 🎉',
        allTopicsFilter: 'All Lessons',
        correctAnswer: 'Correct answer!',
        incorrectAnswer: 'Incorrect answer. The correct one was:',
        quizResult100: 'Perfect!',
        quizResult80: 'Excellent!',
        quizResult60: 'Very good!',
        quizResult40: 'You can do better!',
        quizResult0: 'Keep trying!',
        yourFinalScore: 'Your final score',
        youEarnedXP: 'You earned {xp} XP',
        backToMenu: 'Back to Menu',
        retakeQuiz: 'Retake Quiz',
        question: 'Question',
        quizYourself: 'Quiz Yourself',
        quizSelectionTitle: 'Choose a Quiz',
        quizSelectionBack: 'Back to Quiz Selection',
        quizQuestionCount: 'Choose the number of questions to start.',
        questionsLabel: 'questions',
        quizNotEnoughQuestions: 'Not enough questions for this topic at the moment.',
        settingsDescription: 'Manage your preferences and application data.',
        appearance: 'Appearance',
        lightMode: 'Light Mode',
        resetTheme: 'Reset Theme',
        dataManagement: 'Data Management',
        dataWarning: 'Warning: This action will permanently delete all your progress and purchases and cannot be undone.',
        deleteAllData: 'Delete All Data',
        resetModalTitle: 'Are you sure?',
        resetModalDescription: '<strong>All</strong> your data will be permanently deleted. This includes your experience points, completed levels, purchases, and achievements.',
        resetModalChallenge: 'To confirm, solve the following equation:',
        resetModalPlaceholder: 'Enter the value of x',
        resetModalCancel: 'Cancel',
        resetModalConfirm: 'Yes, delete everything',
        aiGreeting: 'Hello! I am GrammarBot, your English grammar tutor. How can I help you today?',
        aiError: 'Sorry, an error occurred while connecting to the assistant. Please try again.',
        sendMessage: 'Send a message',
        aiThinking: 'Thinking...',
        profileDescription: 'An overview of your progress and achievements.',
        profileStats: 'Progress Statistics',
        profileXP: 'Experience Points (XP):',
        profileLevels: 'Levels Completed:',
        profileTotalProgress: 'Total Progress',
        profileAchievements: 'Unlocked Achievements',
        profileNoAchievements: 'No achievements unlocked yet. Keep learning!',
        storeTitle: 'Rewards Store',
        storeDescription: 'Use your experience points (XP) to purchase unique badges and themes!',
        storeBadges: 'Badges',
        storeThemes: 'Themes',
        storePreview: 'Preview',
        storeThemeActive: 'Active Theme',
        storeThemeActivate: 'Activate Theme',
        storePurchased: 'Purchased',
        storePurchase: 'Purchase',
        badge_bronze_name: 'Bronze Grammar Badge',
        badge_bronze_desc: 'Multiplies all earned XP by 1.15x',
        badge_silver_name: 'Silver Grammar Badge',
        badge_silver_desc: 'Multiplies all earned XP by 1.25x',
        badge_gold_name: 'Gold Grammar Badge',
        badge_gold_desc: 'Multiplies all earned XP by 1.40x',
        badge_expert_name: 'Grammar Expert Badge',
        badge_expert_desc: 'The highest honor, multiplies XP by 1.60x',
        badge_book_name: 'Book Lover Badge',
        badge_book_desc: 'Adds +0.05 to your current XP multiplier.',
        badge_star_name: 'Star of Excellence',
        badge_star_desc: 'Adds +0.05 to your current XP multiplier.',
        theme_ocean_name: 'Ocean Breeze Theme',
        theme_ocean_desc: 'A calming theme with blue and turquoise ocean colors.',
        theme_sunset_name: 'Sunset Glow Theme',
        theme_sunset_desc: 'A warm theme with orange and red sunset colors.',
        theme_forest_name: 'Emerald Forest Theme',
        theme_forest_desc: 'A nature-inspired theme with soothing green colors.',
        ach_first_level_name: 'First Step',
        ach_first_level_desc: 'You successfully completed your first level!',
        ach_first_topic_name: 'Lesson Master',
        ach_first_topic_desc: 'You mastered all levels of a complete lesson.',
        ach_perfect_quiz_name: 'Perfect Score',
        ach_perfect_quiz_desc: 'You got 100% on a quiz (10 questions or more).',
        ach_first_purchase_name: 'First Purchase',
        ach_first_purchase_desc: 'You bought your first item from the store.',
        ach_xp_1000_name: 'Rising Expert',
        ach_xp_1000_desc: 'You reached 1000 experience points!',
        ach_polyglot_name: 'Polyglot',
        ach_polyglot_desc: 'You started your journey in a new language.',
        ach_streak_3_name: 'Committed Learner',
        ach_streak_3_desc: 'Logged in for 3 consecutive days.',
        ach_night_owl_name: 'Night Owl',
        ach_night_owl_desc: 'You studied late at night.',
        ach_early_bird_name: 'Early Bird',
        ach_early_bird_desc: 'You started your day by learning early.',
        ach_shopaholic_name: 'Shopaholic',
        ach_shopaholic_desc: 'You purchased 3 items from the store.',
        ach_theme_collector_name: 'Theme Collector',
        ach_theme_collector_desc: 'You own all available themes.',
        ach_master_ar_name: 'Professor of Arabic',
        ach_master_ar_desc: 'You have mastered all Arabic grammar lessons.',
        ach_master_fr_name: 'Professor of French',
        ach_master_fr_desc: 'You have mastered all French grammar lessons.',
        ach_master_en_name: 'Professor of English',
        ach_master_en_desc: 'You have mastered all English grammar lessons.',
    }
};

export type Translations = typeof translations['ar'];

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ isActive, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`magnetic-effect relative flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--c-bg-surface)] focus-ring-brand ${isActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
        style={isActive ? { backgroundColor: 'var(--c-brand)', color: 'white' } : {}}
    >
        {icon}
        {children}
    </button>
);

type Notification = { id: number; message: string; icon: string; lang: Language };

const Toast: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className={`fixed bottom-5 ${notification.lang === 'ar' ? 'right-5' : 'left-5'} bg-slate-800 border border-brand-light/50 rounded-xl shadow-2xl shadow-brand/20 p-4 flex items-center gap-4 z-50 animation-toast-in`}
      style={{'--toast-from': notification.lang === 'ar' ? '100%' : '-100%'} as React.CSSProperties}
    >
      <div className="w-10 h-10 text-brand-light" dangerouslySetInnerHTML={{ __html: notification.icon }} />
      <div>
        <p className="font-bold text-white">{notification.lang === 'ar' ? 'تهانينا!' : notification.lang === 'fr' ? 'Félicitations !' : 'Congratulations!'}</p>
        <p className="text-slate-300">{notification.message}</p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [language, setLanguage] = useState<Language>('ar');
  const [isLangSwitching, setIsLangSwitching] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [visualEffect, setVisualEffect] = useState<VisualEffect>(null);
  const effectTimeoutRef = useRef<number | null>(null);
  
  const [progress, setProgress] = useState<UserProgress>({
     xp: 0, 
     purchasedItems: [], 
     completedLevels: {}, 
     activeThemeId: 'default', 
     achievements: [], 
     lastLoginDate: '',
     loginStreak: 0
    });
  const [xpGain, setXpGain] = useState<{ amount: number; key: number } | null>(null);
  const [isXpAnimating, setIsXpAnimating] = useState(false);

  // Quiz Flow State
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  
  // Custom Cursor & Magnetic Effect Logic
  useEffect(() => {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    const handleMouseMove = (e: MouseEvent) => {
        const { clientX: posX, clientY: posY } = e;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate(
            { left: `${posX}px`, top: `${posY}px` },
            { duration: 500, fill: "forwards" }
        );
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Magnetic elements
    const magneticElements = document.querySelectorAll('.magnetic-effect');
    const strength = 0.4;

    magneticElements.forEach(el => {
        const element = el as HTMLElement;
        const handleMouseEnter = () => cursorOutline.classList.add('magnetic-hover');
        const handleMouseLeave = () => {
            cursorOutline.classList.remove('magnetic-hover');
            element.style.transform = 'translate(0, 0)';
        };

        const handleMagneticMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        };
        
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mousemove', handleMagneticMove);
    });

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        magneticElements.forEach(el => {
            // Important: cannot easily remove anonymous listeners, but this effect is fine
        });
    };
  }, [activeView, language, isHeaderExpanded]); // Re-run to catch new elements on view/language change
  
  const T = translations[language];
  const GRAMMAR_TOPICS = language === 'ar' ? GRAMMAR_TOPICS_AR : language === 'fr' ? GRAMMAR_TOPICS_FR : GRAMMAR_TOPICS_EN;
  const QUIZ_SETS = language === 'ar' ? QUIZ_SETS_AR : language === 'fr' ? QUIZ_SETS_FR : QUIZ_SETS_EN;

  const playSound = (sound: Sound) => {
    try {
        const soundMap = {
            'correct': 'correct-sound', 'incorrect': 'incorrect-sound',
            'level-up': 'level-up-sound', 'purchase': 'purchase-sound',
            'achievement': 'level-up-sound',
        };
        (document.getElementById(soundMap[sound]) as HTMLAudioElement)?.play().catch(e=>console.error(e));
    } catch (e) { console.error(e); }
  };

  const showNotification = useCallback((message: string, icon: string, lang: Language) => {
    setNotifications(prev => [...prev, { id: Date.now(), message, icon, lang }]);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const triggerVisualEffect = useCallback((effect: VisualEffect, duration: number) => {
    if (effectTimeoutRef.current) {
      clearTimeout(effectTimeoutRef.current);
    }
    setVisualEffect(effect);
    if (effect === 'incorrect-answer') {
        document.body.classList.add('visual-effect-grayscale');
    }
    effectTimeoutRef.current = window.setTimeout(() => {
      setVisualEffect(null);
      document.body.classList.remove('visual-effect-grayscale');
      effectTimeoutRef.current = null;
    }, duration);
  }, []);


  const applyTheme = useCallback((themeId: string) => {
    const root = document.documentElement;
    const themeItem = STORE_ITEMS.find(item => item.id === themeId && item.type === 'theme');
    const themeColors = themeItem?.payload?.colors?.[theme];
    const colorProps = ['--c-brand', '--c-brand-light', '--c-accent', '--c-bg', '--c-bg-surface', '--c-bg-muted', '--c-border', '--c-text-primary', '--c-text-secondary'];
    
    colorProps.forEach(prop => {
        const key = prop as keyof typeof themeColors;
        if (themeColors && themeColors[key]) {
            root.style.setProperty(prop, themeColors[key]);
        } else {
            root.style.removeProperty(prop);
        }
    });
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('appTheme', theme);
    applyTheme(progress.activeThemeId);
  }, [theme, progress.activeThemeId, applyTheme]);
  
  useEffect(() => {
    document.documentElement.classList.toggle('lang-fr', language === 'fr');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Re-apply theme to ensure CSS variables are updated for the new language class
    applyTheme(progress.activeThemeId);
  }, [language, progress.activeThemeId, applyTheme]);
  
  useEffect(() => {
    document.body.classList.remove('visual-effect-grayscale');
    if (visualEffect === 'grayscale' || visualEffect === 'incorrect-answer') {
      document.body.classList.add('visual-effect-grayscale');
    }
    if (visualEffect === 'rainbow' || visualEffect === 'grayscale') {
      const timer = setTimeout(() => setVisualEffect(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  const handleLanguageChange = (newLang: Language) => {
      if(newLang === language) return;
      setIsLangSwitching(true);
      checkAndAwardAchievements({ action: 'switch_language' });
      setTimeout(() => {
          setLanguage(newLang);
          setActiveView('dashboard');
          setSelectedTopic(null);
          setSelectedQuizSet(null);
          setQuizQuestions(null);
          setIsLangSwitching(false);
      }, 300);
  }

  const checkAndAwardAchievements = useCallback((payload?: any) => {
    setProgress(prev => {
        let newProgress = { ...prev };
        let awardedXp = 0;
        let awardedAny = false;

        for (const achievement of ACHIEVEMENTS) {
            if (!newProgress.achievements.includes(achievement.id) && achievement.condition(newProgress, payload)) {
                newProgress.achievements = [...newProgress.achievements, achievement.id];
                awardedXp += achievement.xpReward;
                const T_for_notif = translations[language];
                const ach_name_key = `ach_${achievement.id.replace('ach_','')}_name` as keyof Translations;
                const translated_name = T_for_notif[ach_name_key] || achievement.name;
                showNotification(`${T_for_notif.lang === 'ar' ? 'أحرزت إنجاز' : T_for_notif.lang === 'fr' ? 'Succès débloqué' : 'Achievement unlocked'}: "${translated_name}"! +${achievement.xpReward} XP`, achievement.icon, language);
                playSound('achievement');
                awardedAny = true;
            }
        }
        if (awardedAny) {
           return { ...newProgress, xp: newProgress.xp + awardedXp };
        }
        return prev;
    });
  }, [showNotification, language]);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('nahwProgress');
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      let currentProgress: UserProgress = savedProgress ? JSON.parse(savedProgress) : { xp: 0, purchasedItems: [], completedLevels: {}, activeThemeId: 'default', achievements: [], lastLoginDate: '', loginStreak: 0 };
      
      const lastLogin = new Date(currentProgress.lastLoginDate);
      const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24));
      
      if (currentProgress.lastLoginDate !== todayStr) {
        if (diffDays === 1) {
          currentProgress.loginStreak = (currentProgress.loginStreak || 0) + 1;
        } else {
          currentProgress.loginStreak = 1;
        }
        
        currentProgress.xp += 15 + (currentProgress.loginStreak * 5); // Daily bonus + streak bonus
        showNotification(`${translations[language].lang === 'ar' ? 'مكافأة الدخول اليومي' : translations[language].lang === 'fr' ? 'Bonus de connexion quotidien' : 'Daily login bonus'}! +${15 + (currentProgress.loginStreak * 5)} XP`, "🎁", language);
        currentProgress.lastLoginDate = todayStr;
      }

      setProgress(currentProgress);
      checkAndAwardAchievements({ action: 'login' });
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  }, [showNotification, checkAndAwardAchievements, language]);

  useEffect(() => {
    try {
      localStorage.setItem('nahwProgress', JSON.stringify(progress));
      checkAndAwardAchievements();
    } catch (error) { console.error("Failed to save progress:", error); }
  }, [progress, checkAndAwardAchievements]);
  
  const xpMultiplier = useMemo(() => {
    const mainBadges = progress.purchasedItems
        .map(id => STORE_ITEMS.find(item => item.id === id && item.type === 'badge' && item.payload?.multiplier && item.payload.multiplier > 1))
        .filter(Boolean) as StoreItem[];
    const additiveBadges = progress.purchasedItems
        .map(id => STORE_ITEMS.find(item => item.id === id && item.type === 'badge' && item.payload?.multiplier && item.payload.multiplier < 1))
        .filter(Boolean) as StoreItem[];

    let highestMultiplier = 1;
    if (mainBadges.length > 0) highestMultiplier = Math.max(...mainBadges.map(b => b.payload!.multiplier!));
    const additiveBonus = additiveBadges.reduce((sum, b) => sum + b.payload!.multiplier!, 0);

    return highestMultiplier + additiveBonus;
  }, [progress.purchasedItems]);

  const addXP = useCallback((amount: number) => {
    const finalAmount = Math.round(amount * xpMultiplier);
    setProgress(prev => ({ ...prev, xp: Math.max(0, prev.xp + finalAmount) }));
    setXpGain({ amount: finalAmount, key: Date.now() });

    if (amount > 0) {
        setIsXpAnimating(true);
        setTimeout(() => setIsXpAnimating(false), 500);
        if (xpMultiplier > 1) {
            showNotification(`+${finalAmount} XP (${amount} × ${xpMultiplier.toFixed(2)})`, '✨', language);
        }
    }
  }, [xpMultiplier, showNotification, language]);
  
  const handleCompleteLevel = useCallback((topicId: string, levelId: number) => {
      setProgress(prev => {
          const allTopics = [...GRAMMAR_TOPICS_AR, ...GRAMMAR_TOPICS_FR, ...GRAMMAR_TOPICS_EN];
          const topic = allTopics.find(t => t.id === topicId);
          if (!topic) return prev;
          const level = topic.levels.find(l => l.id === levelId);
          if (!level) return prev;

          const currentCompleted = prev.completedLevels[topicId] || 0;
          if (currentCompleted < levelId) {
             playSound('level-up');
             addXP(level.xpReward);
             const newCompleted = { ...prev.completedLevels, [topicId]: levelId };
             const updatedProgress = { ...prev, completedLevels: newCompleted };
             
             setTimeout(() => checkAndAwardAchievements(), 0);
             return updatedProgress;
          }
          return prev; 
      });
  }, [addXP, checkAndAwardAchievements]);
  
  const handlePurchaseItem = useCallback((item: StoreItem) => {
    setProgress(prev => {
        if (prev.xp >= item.cost && !prev.purchasedItems.includes(item.id)) {
            playSound('purchase');
            const updatedProgress = { ...prev, xp: prev.xp - item.cost, purchasedItems: [...prev.purchasedItems, item.id] };
            setTimeout(() => checkAndAwardAchievements({action: 'purchase'}), 0);
            return updatedProgress;
        }
        return prev;
    });
  }, [checkAndAwardAchievements]);
  
  const handleActivateTheme = useCallback((themeId: string) => setProgress(prev => ({ ...prev, activeThemeId: themeId })), []);
  const handleResetTheme = useCallback(() => setProgress(prev => ({ ...prev, activeThemeId: 'default' })), []);

  const handleQuizComplete = useCallback((result: { score: number, total: number }) => {
    addXP(Math.round((result.score / result.total) * 50));
    checkAndAwardAchievements({...result, action: 'quiz_complete'});
  }, [addXP, checkAndAwardAchievements]);
  
  const handleResetAllData = useCallback(() => {
    try {
        localStorage.clear();
        window.location.reload();
    } catch (error) { console.error("Failed to reset data:", error); }
  }, []);

  const handleApplyCheatCode = useCallback((code: string): boolean => {
      const positiveXpCodes: { [key: string]: number } = {
        'ADD_XP_500': 500, '1234': 100, '4321': 100, 'THANKSPETER': 100, 'PETER': 100,
        'GERGES': 100, 'BESTDEVEZGG': 100, '67AURAFAX': 100, '69420': 100
      };
      const negativeXpCodes: { [key: string]: number } = {
        '676767': -150, '696969': -150, 'SCP67': -150, 'NGA': -150, 'ILIKETOLOSEXP': -150
      };
      
      if (positiveXpCodes[code]) {
          addXP(positiveXpCodes[code]);
          showNotification(`+${positiveXpCodes[code]} XP (Cheat)`, '⚡', language);
          if (code === '69420') {
              setVisualEffect('rainbow');
          }
          return true;
      }
      
      if (negativeXpCodes[code]) {
          addXP(negativeXpCodes[code]);
          showNotification(`${negativeXpCodes[code]} XP (Cheat)`, '💀', language);
          setVisualEffect('grayscale');
          return true;
      }

      switch(code) {
          case 'PG1':
              setProgress(prev => {
                  const allCompleted = { ...prev.completedLevels };
                  const allTopics = [...GRAMMAR_TOPICS_AR, ...GRAMMAR_TOPICS_FR, ...GRAMMAR_TOPICS_EN];
                  allTopics.forEach(topic => {
                      allCompleted[topic.id] = topic.levels.length;
                  });
                  return { 
                      ...prev, 
                      xp: 99999,
                      completedLevels: allCompleted,
                      purchasedItems: STORE_ITEMS.map(i => i.id),
                      achievements: ACHIEVEMENTS.map(a => a.id)
                   };
              });
              showNotification('Unlocked Everything! (Cheat)', '👑', language);
              setTimeout(() => checkAndAwardAchievements(), 0);
              return true;
          case 'COMPLETE_ALL':
               setProgress(prev => {
                  const allCompleted = { ...prev.completedLevels };
                  const allTopics = [...GRAMMAR_TOPICS_AR, ...GRAMMAR_TOPICS_FR, ...GRAMMAR_TOPICS_EN];
                  allTopics.forEach(topic => {
                      allCompleted[topic.id] = topic.levels.length;
                  });
                  return { ...prev, completedLevels: allCompleted };
               });
               showNotification('All lessons completed (Cheat)!', '🎓', language);
               setTimeout(() => checkAndAwardAchievements(), 0);
               return true;
      }
      return false;
  }, [addXP, showNotification, language, checkAndAwardAchievements]);
  
  const handleSelectTopic = (topic: GrammarTopic) => {
    setIsAnimatingOut(true);
    setTimeout(() => {
        setSelectedTopic(topic);
        setActiveView('lesson');
        setIsAnimatingOut(false);
    }, 300);
  };
  
  const handleBackToDashboard = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
        setSelectedTopic(null);
        setActiveView('dashboard');
        setIsAnimatingOut(false);
    }, 300);
  };

  const handleStartQuiz = (count: number) => {
    if (!selectedQuizSet) return;
    const shuffled = [...selectedQuizSet.questions].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, count));
  };
  
  const handlePreviewTheme = useCallback((themeId: string, isPreview: boolean) => {
    if (isPreview) {
        applyTheme(themeId);
    } else {
        applyTheme(progress.activeThemeId);
    }
}, [progress.activeThemeId, applyTheme]);
  
  return (
    <>
      <div id="cursor-dot"></div>
      <div id="cursor-outline"></div>

      <audio id="correct-sound" src="/sounds/correct.mp3" preload="auto"></audio>
      <audio id="incorrect-sound" src="/sounds/incorrect.mp3" preload="auto"></audio>
      <audio id="level-up-sound" src="/sounds/level-up.mp3" preload="auto"></audio>
      <audio id="purchase-sound" src="/sounds/purchase.mp3" preload="auto"></audio>
      <audio id="alarm-sound" src="/sounds/alarm.mp3" preload="auto"></audio>
      
      <div className={`app-container ${isLangSwitching ? 'lang-switching' : ''} ${visualEffect === 'rainbow' ? 'visual-effect-rainbow' : ''}`}>
        <ParticleBackground language={language} theme={theme}/>
        <div className="main-content-wrapper">
          <header className={`app-header ${isHeaderExpanded ? 'expanded' : ''}`}>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: language === 'ar' ? 'Tajawal, sans-serif' : 'inherit' }}>{T.title}</h1>
                    <div className="flex items-center gap-1">
                        <button onClick={() => handleLanguageChange('ar')} className={`lang-btn ${language === 'ar' ? 'active' : ''}`}>AR</button>
                        <button onClick={() => handleLanguageChange('fr')} className={`lang-btn ${language === 'fr' ? 'active' : ''}`}>FR</button>
                        <button onClick={() => handleLanguageChange('en')} className={`lang-btn ${language === 'en' ? 'active' : ''}`}>EN</button>
                    </div>
                </div>
                
                <div className={`xp-display ${isXpAnimating ? 'xp-pulse' : ''}`}>
                    <span>{progress.xp} XP</span>
                    {xpGain && <span key={xpGain.key} className="xp-gain-animation">+{xpGain.amount}</span>}
                </div>
                
                <nav className="hidden md:flex items-center gap-2">
                    {Object.entries(ICONS).map(([view, icon]) => (
                        <NavButton key={view} isActive={activeView === view} onClick={() => setActiveView(view as View)} icon={icon}>
                            {T[view as keyof Translations]}
                        </NavButton>
                    ))}
                </nav>
                 <button className="md:hidden text-white" onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
            
                 <nav className={`header-nav-mobile ${isHeaderExpanded ? 'expanded' : ''} w-full md:hidden`}>
                   <div className="flex flex-col items-center gap-2 mt-4 p-4 bg-slate-800/50 rounded-lg">
                    {Object.entries(ICONS).map(([view, icon]) => (
                        <NavButton key={view} isActive={activeView === view} onClick={() => { setActiveView(view as View); setIsHeaderExpanded(false); }} icon={icon}>
                            {T[view as keyof Translations]}
                        </NavButton>
                    ))}
                    </div>
                </nav>
          </header>

          <main className="flex-grow w-full max-w-5xl mx-auto p-4 md:p-8">
            <div className={`main-view-container ${isAnimatingOut ? 'animation-view-out' : ''}`}>
                {activeView === 'dashboard' && <Dashboard onSelectTopic={handleSelectTopic} progress={progress} topics={GRAMMAR_TOPICS} T={T}/>}
                {activeView === 'lesson' && selectedTopic && <GrammarSection topic={selectedTopic} onBack={handleBackToDashboard} completedLevels={progress.completedLevels[selectedTopic.id] || 0} onCompleteLevel={handleCompleteLevel} triggerVisualEffect={triggerVisualEffect} T={T} />}
                {activeView === 'quiz' && <QuizFlow selectedQuizSet={selectedQuizSet} quizQuestions={quizQuestions} onSelectQuizSet={setSelectedQuizSet} onStartQuiz={handleStartQuiz} onBack={() => { setQuizQuestions(null); setSelectedQuizSet(null); }} onQuizComplete={handleQuizComplete} playSound={playSound} triggerVisualEffect={triggerVisualEffect} quizSets={QUIZ_SETS} T={T} />}
                {activeView === 'store' && <Store progress={progress} onPurchase={handlePurchaseItem} onActivateTheme={handleActivateTheme} onPreviewTheme={handlePreviewTheme} T={T}/>}
                {activeView === 'settings' && <Settings theme={theme} onSetTheme={setTheme} onResetTheme={handleResetTheme} activeThemeId={progress.activeThemeId} onResetAllData={handleResetAllData} onApplyCheatCode={handleApplyCheatCode} T={T} />}
                {activeView === 'profile' && <Profile progress={progress} topics={GRAMMAR_TOPICS} T={T} />}
            </div>
          </main>
        </div>
        
        <button onClick={() => setIsChatbotOpen(true)} className="chatbot-fab">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v7.5a2.25 2.25 0 002.25 2.25z" /></svg>
        </button>

        {isChatbotOpen && <AiChatbot language={language} onClose={() => setIsChatbotOpen(false)} T={T}/>}
        {notifications.map(n => <Toast key={n.id} notification={n} onDismiss={() => dismissNotification(n.id)} />)}
      </div>
    </>
  );
};

export default App;