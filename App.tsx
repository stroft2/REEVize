import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GrammarSection from './components/GrammarSection';
import ExampleGenerator from './components/ExampleGenerator';
import QuizFlow from './components/QuizFlow';
import ParticleBackground from './components/ParticleBackground';
import CompleteSentence from './components/CompleteSentence';
import Settings from './components/Settings';
import AiChatbot from './components/AiChatbot';
import Dashboard from './components/Dashboard';
import Store from './components/Store';
import Profile from './components/Profile';
import { 
    GRAMMAR_TOPICS_AR, QUIZ_SETS_AR, STORE_ITEMS, ACHIEVEMENTS,
    GRAMMAR_TOPICS_FR, QUIZ_SETS_FR
} from './constants';
import type { QuizSet, QuizQuestion, GrammarTopic, UserProgress, StoreItem, Achievement } from './types';

type View = 'dashboard' | 'lesson' | 'generator' | 'completer' | 'quiz' | 'store' | 'settings' | 'profile';
type Sound = 'correct' | 'incorrect' | 'level-up' | 'purchase' | 'achievement';
type Language = 'ar' | 'fr';
type VisualEffect = 'rainbow' | 'grayscale' | 'correct-answer' | 'incorrect-answer' | null;

const ICONS: Record<Exclude<View, 'lesson'>, React.ReactNode> = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    generator: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>,
    completer: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.5,5.5h-0.959c-0.23,0-0.45,0.082-0.627,0.24L10.5,9.586L8.087,7.172C7.91,7.016,7.69,6.934,7.459,6.934H6.5c-0.414,0-0.75,0.336-0.75,0.75v0.922c0,0.229,0.084,0.449,0.244,0.625l3.5,3.594c0.195,0.199,0.451,0.293,0.707,0.293s0.512-0.094,0.707-0.293l4.5-4.594C15.916,10.375,16,10.156,16,9.926V9c0-0.414-0.336-0.75-0.75-0.75h-0.922c-0.229,0-0.449-0.084-0.625-0.244L10.5,4.414l2.413,2.413C12.984,6.899,13.204,6.98,13.434,6.98H14.5c0.414,0,0.75-0.336,0.75-0.75V5.5C15.25,5.086,14.914,4.75,14.5,4.75z M4,4h8c0.552,0,1,0.448,1,1s-0.448,1-1,1H4C3.448,6,3,5.552,3,5S3.448,4,4,4z M13,15h-1v-2c0-0.552-0.448-1-1-1H5c-0.552,0-1,0.448-1,1v2H3c-0.552,0-1,0.448-1,1s0.448,1,1,1h10c0.552,0,1-0.448,1-1S13.552,15,13,15z" clipRule="evenodd"/></svg>,
    quiz: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3,2.268a2,2,0,0,0-2.6,0l-6,5.25A2,2,0,0,0,2,9.25v6.5a2,2,0,0,0,2,2h12a2,2,0,0,0,2-2v-6.5a2,2,0,0,0-0.7-1.732l-6-5.25ZM10,4.5l6,5.25v6.5H4v-6.5L10,4.5ZM9,11v4h2v-4H9Zm0-3h2v2H9V8Z" clipRule="evenodd" /></svg>,
    store: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l.237-.237.954-3.818.008-.032.01-.041L9.4 3H15a1 1 0 000-2H3zM6 16a2 2 0 100 4 2 2 0 000-4zm9-2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    profile: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379-1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
};

const translations = {
    ar: {
        lang: 'ar',
        dashboard: 'الرئيسية',
        generator: 'مولّد الاختبارات',
        completer: 'أكمل الجملة',
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
        generatorTitle: 'مولّد الاختبارات الذكي',
        generatorDescription: 'احصل على اختبارات ذكاء اصطناعي جديدة لفهم القواعد بشكل أفضل.',
        filterByLesson: 'فلترة حسب الدرس',
        noExamples: 'لا توجد أمثلة لهذا الفلتر.',
        correctAnswer: 'إجابة صحيحة!',
        incorrectAnswer: 'إجابة خاطئة. الصحيحة هي:',
        generateNewExample: 'توليد اختبار جديد',
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
        completerTitle: 'أكمل الجملة',
        completerDescription: 'اختر الكلمة المناسبة لإكمال الجملة بشكل صحيح.',
        selectRequiredType: 'اختر النوع المطلوب',
        requiredLabel: 'المطلوب:',
        correctAnswerXP: 'إجابة صحيحة! +5 XP',
        correctAnswerIs: 'الإجابة الصحيحة هي:',
        newExercise: 'تمرين جديد',
        noExercises: 'لا توجد تمارين لهذا الفلتر حاليًا.',
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
        aiGenerating: 'جاري التوليد...',
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
    },
    fr: {
        lang: 'fr',
        dashboard: 'Accueil',
        generator: 'Générateur de Quiz',
        completer: 'Compléter',
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
        generatorTitle: 'Générateur de Quiz IA',
        generatorDescription: 'Obtenez de nouveaux quiz générés par IA pour mieux comprendre les règles.',
        filterByLesson: 'Filtrer par leçon',
        noExamples: 'Aucun exemple pour ce filtre.',
        correctAnswer: 'Bonne réponse !',
        incorrectAnswer: 'Mauvaise réponse. La bonne était :',
        generateNewExample: 'Générer un nouveau quiz',
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
        completerTitle: 'Complétez la phrase',
        completerDescription: 'Choisissez le bon mot pour compléter la phrase correctement.',
        selectRequiredType: 'Sélectionnez le type requis',
        requiredLabel: 'Requis :',
        correctAnswerXP: 'Bonne réponse ! +5 XP',
        correctAnswerIs: 'La bonne réponse est :',
        newExercise: 'Nouvel exercice',
        noExercises: 'Aucun exercice pour ce filtre pour le moment.',
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
        aiGenerating: 'Génération en cours...',
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
        className={`magnetic-effect relative flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--c-bg-surface)] focus-ring-brand ${isActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
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
    <div className={`fixed bottom-5 ${notification.lang === 'ar' ? 'right-5' : 'left-5'} bg-slate-800 border border-brand-light/50 rounded-xl shadow-2xl shadow-brand/20 p-4 flex items-center gap-4 z-50 animation-view-in`}>
      <div className="w-10 h-10 text-brand-light" dangerouslySetInnerHTML={{ __html: notification.icon }} />
      <div>
        <p className="font-bold text-white">{notification.lang === 'ar' ? 'تهانينا!' : 'Félicitations !'}</p>
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
  
  // Focus Tools (Timer/Stopwatch) State - Lifted from Settings
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef<number | null>(null);
    const [stopwatchMs, setStopwatchMs] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const stopwatchIntervalRef = useRef<number | null>(null);
    const [laps, setLaps] = useState<number[]>([]);
    
    // Timer Logic
    const handleTimerStartStop = useCallback(() => {
        if (isTimerRunning) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
        } else {
            setIsTimerRunning(true);
            timerIntervalRef.current = window.setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                        setIsTimerRunning(false);
                        (document.getElementById('alarm-sound') as HTMLAudioElement)?.play();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [isTimerRunning]);

    const handleTimerReset = (newDuration: number) => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setIsTimerRunning(false);
        setTimerSeconds(newDuration * 60);
    };

    // Stopwatch Logic
    const handleStopwatchStartStop = useCallback(() => {
        if (isStopwatchRunning) {
            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        } else {
            const startTime = Date.now() - stopwatchMs;
            stopwatchIntervalRef.current = window.setInterval(() => {
                setStopwatchMs(Date.now() - startTime);
            }, 10);
        }
        setIsStopwatchRunning(!isStopwatchRunning);
    }, [isStopwatchRunning, stopwatchMs]);

    const handleStopwatchReset = useCallback(() => {
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        setIsStopwatchRunning(false);
        setStopwatchMs(0);
        setLaps([]);
    }, []);
    
    const handleLap = useCallback(() => {
        if(isStopwatchRunning) setLaps(prev => [stopwatchMs, ...prev]);
    }, [isStopwatchRunning, stopwatchMs]);
    
    useEffect(() => {
        return () => { // Cleanup timers on component unmount
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        };
    }, []);

    // Custom Cursor Logic
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

      const handleMouseEnter = () => {
          cursorOutline.classList.add('magnetic-hover');
      };
      const handleMouseLeave = () => {
          cursorOutline.classList.remove('magnetic-hover');
      };

      window.addEventListener('mousemove', handleMouseMove);

      const interactiveElements = document.querySelectorAll(
          'button, a, .topic-card, [role="button"], input, select'
      );
      interactiveElements.forEach(el => {
          el.addEventListener('mouseenter', handleMouseEnter);
          el.addEventListener('mouseleave', handleMouseLeave);
      });

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          interactiveElements.forEach(el => {
              el.removeEventListener('mouseenter', handleMouseEnter);
              el.removeEventListener('mouseleave', handleMouseLeave);
          });
      };
    }, [activeView]); // Re-run to catch new elements on view change
  
  const T = translations[language];
  const GRAMMAR_TOPICS = language === 'ar' ? GRAMMAR_TOPICS_AR : GRAMMAR_TOPICS_FR;
  const QUIZ_SETS = language === 'ar' ? QUIZ_SETS_AR : QUIZ_SETS_FR;

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
                showNotification(`${language === 'ar' ? 'أحرزت إنجاز' : 'Succès débloqué'}: "${translated_name}"! +${achievement.xpReward} XP`, achievement.icon, language);
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
        showNotification(`${language === 'ar' ? 'مكافأة الدخول اليومي' : 'Bonus de connexion quotidien'}! +${15 + (currentProgress.loginStreak * 5)} XP`, "🎁", language);
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
          const topic = GRAMMAR_TOPICS_AR.concat(GRAMMAR_TOPICS_FR).find(t => t.id === topicId);
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
                  const allTopics = [...GRAMMAR_TOPICS_AR, ...GRAMMAR_TOPICS_FR];
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
                  const allTopics = [...GRAMMAR_TOPICS_AR, ...GRAMMAR_TOPICS_FR];
                  allTopics.forEach(topic => {
                      allCompleted[topic.id] = topic.levels.length;
                  });
                  return { ...prev, completedLevels: allCompleted };
              });
               showNotification('All lessons completed! (Cheat)', '🎓', language);
               return true;
          default:
              return false;
      }
  }, [addXP, showNotification, language, checkAndAwardAchievements]);

  const handleViewChange = (newView: View) => {
    if (newView === activeView || isAnimatingOut) return;
    setIsAnimatingOut(true);
    setTimeout(() => {
      setActiveView(newView);
      setSelectedTopic(null);
      setSelectedQuizSet(null);
      setQuizQuestions(null);
      setIsAnimatingOut(false);
    }, 300);
  };
  
  const handleSelectTopic = (topic: GrammarTopic) => {
      setIsAnimatingOut(true);
      setTimeout(() => {
          setSelectedTopic(topic);
          setActiveView('lesson');
          setIsAnimatingOut(false);
      }, 300)
  }

  // Quiz Flow Handlers
  const handleSelectQuizSet = (quizSet: QuizSet | null) => {
      setSelectedQuizSet(quizSet);
      setQuizQuestions(null); 
  };
  const handleStartQuiz = (count: number) => {
      if (selectedQuizSet) {
          const shuffled = [...selectedQuizSet.questions].sort(() => 0.5 - Math.random());
          setQuizQuestions(shuffled.slice(0, count));
      }
  };
  const handleBackFromQuiz = () => {
      setQuizQuestions(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard onSelectTopic={handleSelectTopic} progress={progress} topics={GRAMMAR_TOPICS} T={T} />;
      case 'lesson':
        return selectedTopic && <GrammarSection topic={selectedTopic} onBack={() => handleViewChange('dashboard')} completedLevels={progress.completedLevels[selectedTopic.id] || 0} onCompleteLevel={handleCompleteLevel} triggerVisualEffect={triggerVisualEffect} T={T} />;
      case 'generator': return <ExampleGenerator addXP={addXP} grammarTopics={GRAMMAR_TOPICS} language={language} playSound={playSound} triggerVisualEffect={triggerVisualEffect} T={T} />;
      case 'completer': return <CompleteSentence addXP={addXP} grammarTopics={GRAMMAR_TOPICS} language={language} triggerVisualEffect={triggerVisualEffect} T={T} />;
      case 'quiz': return <QuizFlow 
                            quizSets={QUIZ_SETS} 
                            onQuizComplete={(result) => {
                                handleQuizComplete(result);
                                handleSelectQuizSet(null);
                            }} 
                            playSound={playSound} 
                            triggerVisualEffect={triggerVisualEffect}
                            T={T}
                            selectedQuizSet={selectedQuizSet}
                            quizQuestions={quizQuestions}
                            onSelectQuizSet={handleSelectQuizSet}
                            onStartQuiz={handleStartQuiz}
                            onBack={handleBackFromQuiz}
                         />;
      case 'store': return <Store progress={progress} onPurchase={handlePurchaseItem} onActivateTheme={handleActivateTheme} onPreviewTheme={(id, isPreview) => applyTheme(isPreview ? id : progress.activeThemeId)} T={T} />;
      case 'profile': return <Profile progress={progress} topics={GRAMMAR_TOPICS_AR.concat(GRAMMAR_TOPICS_FR)} T={T} />;
      case 'settings':
        return <Settings 
            theme={theme} onSetTheme={setTheme} 
            onResetTheme={handleResetTheme}
            activeThemeId={progress.activeThemeId}
            onResetAllData={handleResetAllData}
            onApplyCheatCode={handleApplyCheatCode}
            T={T}
            // Pass timer state and handlers
            timerSeconds={timerSeconds}
            isTimerRunning={isTimerRunning}
            onTimerStartStop={handleTimerStartStop}
            onTimerReset={handleTimerReset}
            // Pass stopwatch state and handlers
            stopwatchMs={stopwatchMs}
            isStopwatchRunning={isStopwatchRunning}
            laps={laps}
            onStopwatchStartStop={handleStopwatchStartStop}
            onStopwatchReset={handleStopwatchReset}
            onLap={handleLap}
         />;
      default: return null;
    }
  };
  
  const xpBarPercentage = (progress.xp % 1000) / 10;

  return (
    <div className="min-h-screen bg-transparent text-gray-200">
      <ParticleBackground language={language} theme={theme} />
      {visualEffect === 'rainbow' && <div className="visual-effect-rainbow"></div>}
      {visualEffect === 'correct-answer' && <div className="visual-effect-correct-flash"></div>}
      {visualEffect === 'incorrect-answer' && (
        <div className="visual-effect-rain">
          {Array.from({ length: 150 }).map((_, i) => (
            <div key={i} className="raindrop" style={{ left: `${Math.random() * 100}vw`, animationDuration: `${Math.random() * 0.5 + 0.3}s`, animationDelay: `${Math.random() * 5}s` }} />
          ))}
        </div>
      )}
      {notifications.map(n => 
        <Toast key={n.id} notification={n} onDismiss={() => dismissNotification(n.id)} />
      )}
      {isChatbotOpen && <AiChatbot language={language} onClose={() => setIsChatbotOpen(false)} T={T} />}
      <header className="app-header p-4">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center">
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center space-x-3 space-x-reverse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--c-brand)]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10.392C2.057 15.71 3.245 16 4.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10.392c1.057.514 2.245.804 3.5.804 1.255 0 2.443-.29 3.5-.804V4.804C16.943 4.29 15.755 4 14.5 4z" />
                    </svg>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-brand tracking-wide">
                        {T.title}
                    </h1>
                </div>
                <button 
                    onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                    className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700/50"
                    aria-label="Toggle navigation"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
          
          <div className={`header-nav-mobile md:!max-h-none md:!opacity-100 md:!overflow-visible md:flex md:items-center md:gap-2 ${isHeaderExpanded ? 'expanded' : ''}`}>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleLanguageChange(language === 'ar' ? 'fr' : 'ar')}
                        className="magnetic-effect bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2.5 font-bold text-lg flex items-center gap-2 text-white hover:bg-slate-700 transition-colors"
                        aria-label={`Switch to ${language === 'ar' ? 'French' : 'Arabic'}`}
                    >
                        {language === 'ar' ? 'FR' : 'AR'}
                    </button>
                    <div className="relative">
                        <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-2 font-bold text-lg flex items-center gap-2">
                            <span className="text-yellow-400">XP:</span> 
                            <span className={isXpAnimating ? 'xp-counter-animated' : ''}>{progress.xp}</span>
                            {xpMultiplier > 1 && <span className="text-xs bg-fuchsia-500/30 text-fuchsia-300 px-2 py-0.5 rounded-full font-bold">x{xpMultiplier.toFixed(2)}</span>}
                        </div>
                        <div className="xp-bar-wrapper">
                            <div className="xp-bar-inner" style={{ width: `${xpBarPercentage}%` }}></div>
                        </div>
                         {xpGain && (
                            <div key={xpGain.key} className="xp-gain-popup text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                                +{xpGain.amount} XP!
                            </div>
                        )}
                    </div>
                </div>
                <nav className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-1.5 flex flex-wrap justify-center gap-1 mt-2 sm:mt-0">
                    {(['dashboard', 'generator', 'completer', 'quiz', 'store', 'profile', 'settings'] as Exclude<View, 'lesson'>[]).map((view) => (
                        <NavButton key={view} isActive={activeView === view} onClick={() => handleViewChange(view)} icon={ICONS[view]}>
                            {T[view]}
                        </NavButton>
                    ))}
                </nav>
             </div>
          </div>
        </div>
      </header>
      
      <main className={`container mx-auto max-w-6xl p-4 md:p-8 transition-all duration-300 ${isAnimatingOut ? 'animation-view-out' : 'animation-view-in'} ${isLangSwitching ? 'animation-lang-switch-out' : 'animation-lang-switch-in'}`}>
        {renderContent()}
      </main>

       <button
            onClick={() => setIsChatbotOpen(true)}
            className="magnetic-effect fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full bg-gradient-brand text-white shadow-2xl shadow-brand/40 flex items-center justify-center transform hover:scale-110 transition-transform duration-300 interactive-press"
            aria-label="Open AI Chatbot"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v7.5a2.25 2.25 0 002.25 2.25z" /></svg>
        </button>

    </div>
  );
};

export default App;