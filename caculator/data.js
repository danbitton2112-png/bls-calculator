/**
 * מחשבון מיצוי זכויות ונזקי גוף — בן לולו סיבוני משרד עורכי דין
 * גרסה בעברית בלבד (RTL מלא)
 * ליווי אישי וצמוד • ניסיון משפטי מוכח • מאבק עד לתוצאה
 */

(function () {
  'use strict';

  const ilsFormatter = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0
  });

  const formatILS = (amount) => ilsFormatter.format(amount);

  const I18N = {
    he: {
      dir: 'rtl',
      htmlLang: 'he',
      pageTitle: 'מחשבון מיצוי זכויות ונזקי גוף | בן לולו סיבוני – משרד עורכי דין',
      skipLink: 'דילוג לתוכן השאלון',
      headerPhoneLabel: 'ייעוץ ללא עלות:',
      waFabLabel: 'ייעוץ בווטסאפ',
      waFabMessage: 'שלום, הגעתי ממחשבון הזכויות של משרד עורכי דין בן לולו סיבוני. אשמח לקבוע שיחת ייעוץ ראשונית ללא עלות.',
      footerFirm: 'בן לולו סיבוני · משרד עורכי דין',
      footerAddress: 'רחוב יונה הנביא 2, משרד 105, אשדוד',
      footerPhoneLabel: 'טלפון:',
      footerHours: 'ימים א׳–ה׳, 09:00–18:00',
      footerDisclaimer: 'המחשבון מספק הערכה ראשונית ואינפורמטיבית בלבד, ואינו מהווה ייעוץ משפטי או תחליף לפגישת ייעוץ פרטנית ובחינת התיק הרפואי.',
      footerSiteLink: 'לאתר המשרד',
      footerAdminLink: 'מערכת ניהול פניות',
      footerReset: 'איפוס והתחלה מחדש',

      intro: {
        kicker: 'בדיקת זכאות ראשונית ללא עלות • כ־90 שניות',
        titleAccent: 'זקוקים לייעוץ משפטי?',
        titleRest: 'אנחנו נלחמים על הפיצוי שמגיע לכם!',
        lead: 'עונים על מספר שאלות ממוקדות ומקבלים מפת זכויות ראשונית מבית משרד עורכי דין בן לולו סיבוני — תאונות דרכים, תאונות עבודה, ביטוח לאומי, נפגעי איבה, משרד הביטחון ותביעות ביטוח.',
        aboutTitle: 'אודות משרד בן לולו סיבוני',
        aboutText: 'משרד עורכי דין בן לולו סיבוני מעניק ייצוג משפטי מקצועי, אישי ונחוש. אנו בונים אסטרטגיה מותאמת, מנהלים מאבק בלתי מתפשר מול חברות הביטוח והמוסדות, ופועלים למימוש מקסימלי של כל הזכויות והפיצויים.',
        cta: 'התחלת בדיקת הזכאות',
        ctaResume: 'המשך מהמקום שבו עצרנו',
        note: 'הבדיקה אינה מחייבת ואינה דורשת מסמכים רפואיים בשלב זה.',
        monolithFooterLeft: 'בדיקה דיסקרטית ומיידית',
        monolithFooterRight: 'חיסיון עו״ד־לקוח מלא',
        trustItems: [
          {
            title: 'ליווי אישי וצמוד',
            desc: 'כל תיק מנוהל באופן פרטני על ידי שותפי המשרד, בזמינות גבוהה ובשקיפות מלאה.'
          },
          {
            title: 'ניסיון משפטי מוכח',
            desc: 'בקיאות מעמיקה בליטיגציה מורכבת מול חברות הביטוח, ביטוח לאומי ומשרד הביטחון.'
          },
          {
            title: 'מאבק עד לתוצאה',
            desc: 'בדיקת התיק לעומק, בניית אסטרטגיה מנצחת ומאבק נחוש עד להשגת הפיצוי המקסימלי.'
          }
        ]
      },

      ui: {
        stepOf: (cur, total) => `שלב ${cur} מתוך ${total}`,
        railTitle: (cur, total) => `שלבי הבדיקה (${cur} מתוך ${total})`,
        railTrust: 'כל הנתונים נשמרים בחיסיון עו״ד־לקוח מלא ומשמשים להערכת הזכאות בלבד.',
        back: 'חזרה',
        next: 'המשך',
        enterQuiz: 'כניסה לשאלון',
        showResults: 'הצגת תוצאות הזכאות',
        resetToast: 'השאלון אופס — אפשר להתחיל בדיקה חדשה.',
        errAge: 'יש להזין גיל תקין בין 1 ל־115.',
        errName: 'יש להזין שם מלא (לפחות שני תווים).',
        errPhone: 'יש להזין מספר טלפון ישראלי תקין (למשל 050-1234567).',
        errDual: 'יש לבחור תשובה בכל אחד משני הסעיפים כדי להמשיך.',
        errMulti: 'יש לבחור לפחות אפשרות אחת כדי להמשיך.',
        errDemo: 'יש לבחור מין ולהזין גיל תקין בין 1 ל־115.',
        ageLabel: 'גיל (בשנים)',
        ageUnit: 'שנים',
        agePresetsLabel: 'או בחירה מהירה של קבוצת גיל:',
        nameLabel: 'שם מלא',
        namePlaceholder: 'לדוגמה: ישראל ישראלי',
        phoneLabel: 'טלפון נייד',
        phoneHelp: 'מספר ישראלי תקין לקבלת תוצאות הדוח ולתיאום שיחת ייעוץ ראשונית ללא עלות.',
        consentText: 'אישור ליצירת קשר ראשוני ממשרד עורכי דין בן לולו סיבוני לצורך בדיקת הזכאות. הפרטים נשמרים בחיסיון עו״ד־לקוח מלא וללא כל התחייבות.',
        resultsEyebrow: 'דוח הערכת זכאות ראשוני • בן לולו סיבוני עורכי דין',
        resultsDateLabel: 'תאריך הפקה:',
        resultsTitleNamed: (name) => `תמונת הזכויות הראשונית עבור ${name}`,
        resultsTitleAnon: 'תמונת הזכויות הראשונית מוכנה',
        resultsLeadHigh: (total, high) => `אותרו ${total} אפיקי פיצוי וזכויות רלוונטיים (מתוכם ${high} בעדיפות גבוהה) על בסיס נתוני המקרה.`,
        resultsLeadGeneral: (total) => `אותרו ${total} כיווני זכאות מרכזיים שמומלץ לבחון בהקדם עם עורך דין.`,
        kpiTracks: 'מסלולי זכויות שנמצאו',
        kpiPriority: 'בעדיפות גבוהה או דחופה',
        kpiConsult: 'עלות שיחת ייעוץ במשרד',
        legendLikely: 'סבירות גבוהה לזכאות',
        legendPossible: 'ייתכן שיש זכאות – כדאי לבדוק',
        legendUrgent: 'דרוש בירור דחוף',
        legendInfo: 'מידע חשוב',
        nextStepPrefix: 'הצעד הבא המומלץ:',
        summaryToggleTitle: 'סיכום הנתונים שהוזנו בשאלון',
        summaryToggleAction: 'הצגה / הסתרה',
        summaryAgeGender: 'גיל ומין',
        summaryWorkIncome: 'מצב תעסוקתי והכנסה',
        summaryCauses: 'עילת הפגיעה והרקע',
        summaryDisability: 'אחוזי נכות רשמיים',
        summaryDocs: 'תיעוד רפואי ופוליסות',
        summaryMedical: 'תחומים רפואיים',
        summaryRep: 'ייצוג משפטי',
        ctaTitleNamed: (name) => `שלום ${name}, משרד בן לולו סיבוני לשירותך`,
        ctaTitleAnon: 'תיאום שיחת ייעוץ ראשונית לבחינת התיק ללא עלות',
        ctaBodyPhone: (phone) => `פרטי הבדיקה נשמרו בהצלחה עבור המספר ${phone}. ניתן לשלוח את הדוח ישירות לעורכי הדין בוואטסאפ או לחייג מיד:`,
        ctaBodyGeneric: 'עו״ד אור בן לולו ועו״ד מתן סיבוני בוחנים כל פנייה באופן אישי במטרה לבנות אסטרטגיה מנצחת ולהילחם על מלוא הפיצוי המגיע לכם.',
        ctaWhatsapp: 'שליחת הדוח בוואטסאפ למשרד',
        ctaCall: 'חיוג ישיר למשרד:',
        ctaMail: 'שליחה בדוא״ל',
        btnPrint: 'שמירה כ־PDF / הדפסה',
        btnEdit: 'עריכת תשובות',
        btnRestart: 'בדיקה חדשה מהתחלה'
      },

      railLabels: {
        contact: 'פרטי קשר',
        demographics: 'גיל ומין',
        causes: 'עילת הפגיעה',
        work_income: 'תעסוקה והכנסה',
        disability_percent: 'אחוזי נכות',
        incident_details: 'מועד והשלכות',
        docs_insurance: 'תיעוד וביטוחים',
        medical_areas: 'תחומים רפואיים',
        representation: 'ייצוג משפטי'
      },

      domainProofs: {
        road_accident: {
          badge: 'ניסיון משפטי מוכח בתאונות דרכים',
          text: 'משרד בן לולו סיבוני מייצג נפגעי תאונות דרכים מול חברות הביטוח והמוסד לביטוח לאומי, עם ליווי צמוד עד לקבלת הפיצוי המקסימלי.'
        },
        work_injury: {
          badge: 'מומחיות בנפגעי עבודה וביטוח לאומי',
          text: 'ייצוג עובדים שנפגעו פיזית או נפשית במקום עבודתם, כולל ניהול ההתנהלות מול ועדות ביטוח לאומי ללא פשרות.'
        },
        hostilities_terror: {
          badge: 'ייצוג מיוחד לנפגעי איבה וטרור',
          text: 'משרד בן לולו סיבוני מתמחה בליווי וייצוג נפגעי פעולות איבה וטרור למימוש זכויות מלא מול משרד הביטחון ורשויות המדינה.'
        },
        defense_ministry: {
          badge: 'מימוש זכויות מול משרד הביטחון',
          text: 'טיפול מקיף בתביעות מול משרד הביטחון – הכרה בנכות, קצבאות, החמרת מצב וייצוג בוועדות הרפואיות של אגף שיקום.'
        },
        national_insurance: {
          badge: 'מימוש זכויות מלא בביטוח לאומי',
          text: 'מאבק נחוש להכרה בנכות כללית, נכות מקצועית, קצבאות שר״מ ופטור ממס הכנסה – גם במקרים שסורבו בעבר.'
        },
        insurance_claims: {
          badge: 'ליטיגציה מורכבת מול חברות הביטוח',
          text: 'ניהול תביעות מול חברות הביטוח הגדולות לקבלת הפיצוי המירבי בהתאם לפוליסות אובדן כושר עבודה, סיעוד ותאונות אישיות.'
        },
        medical_malpractice: {
          badge: 'נזקי גוף ורשלנות רפואית',
          text: 'בחינה מעמיקה של התיק המשפטי והרפואי, בניית אסטרטגיה חזקה ומאבק בלתי מתפשר לפיצוי הולם בגין נזקי גוף.'
        },
        default: {
          badge: 'בן לולו סיבוני · משרד עורכי דין',
          text: 'ליווי אישי וצמוד, ניסיון משפטי מוכח ומאבק עד לתוצאה – בדיקת זכאות ראשונית ללא עלות וללא התחייבות.'
        }
      },

      steps: {
        contact: {
          badge: 'פרטים אישיים',
          title: 'איך תרצו שניצור איתכם קשר?',
          subtitle: 'מזינים שם ומספר טלפון כדי לפתוח את השאלון ולקבל בסיומו דוח זכאות מותאם אישית ושיחת ייעוץ ראשונית ללא עלות עם עורכי הדין במשרד.'
        },
        demographics: {
          badge: 'פרטים כלליים',
          title: 'גיל ומין לצורך התאמת החישוב',
          subtitle: 'הגיל והמין קובעים את גיל הפרישה ואת מסלולי הזכאות הרלוונטיים (חיילים, נכות כללית, שר״מ, נפגעי עבודה או פטור ממס).',
          genderTitle: 'מין:',
          genderOptions: [
            { value: 'female', label: 'אישה' },
            { value: 'male', label: 'גבר' },
            { value: 'unspecified', label: 'ללא ציון' }
          ],
          agePresets: [
            { label: 'מתחת ל־18', value: 16 },
            { label: '18–35 (צעירים / שירות צבאי)', value: 26 },
            { label: '36–55', value: 45 },
            { label: '56–67', value: 62 },
            { label: '68 ומעלה', value: 72 }
          ]
        },
        causes: {
          badge: 'רקע רפואי ועילת הפגיעה',
          title: 'אילו מהמצבים הבאים רלוונטיים למקרה שלכם?',
          subtitle: 'ניתן לסמן יותר מאפשרות אחת — במקרים רבים קיימת זכאות במספר ערוצים משפטיים במקביל.',
          options: [
            { value: 'road_accident', label: 'תאונת דרכים (נהג, נוסע, הולך רגל, אופנוע)', hint: 'פיצוי כספי על פי חוק הפלת"ד ללא תלות באשמה, מול חברות הביטוח וביטוח לאומי.' },
            { value: 'work_injury', label: 'תאונת עבודה, מחלת מקצוע או מיקרוטראומה', hint: 'פגיעה באתר העבודה, בדרך אליה או בחזרה, או נזק בריאותי מצטבר עקב תנאי העבודה.' },
            { value: 'hostilities_terror', label: 'נפגע/ת פעולות איבה וטרור', hint: 'ייצוג ייחודי להכרה, תגמולים חודשיים, מענקים וזכויות מול משרד הביטחון וביטוח לאומי.' },
            { value: 'defense_ministry', label: 'פגיעה במהלך שירות צבאי או בכוחות הביטחון', hint: 'תביעות מול משרד הביטחון ואגף שיקום – פציעה, מחלה שהתפרצה או החמרת מצב.' },
            { value: 'national_insurance', label: 'מחלה / מגבלה רפואית (נכות כללית ופטור ממס)', hint: 'בדיקת זכאות לקצבת נכות כללית, שר״מ, ניידות או פטור ממס הכנסה (סעיף 9(5)).' },
            { value: 'insurance_claims', label: 'תביעות ביטוח פרטי ואובדן כושר עבודה', hint: 'תביעות לתשלום חודשי או פיצוי חד־פעמי מפוליסות מנהלים, תאונות אישיות, בריאות וסיעוד.' },
            { value: 'medical_malpractice', label: 'נזקי גוף, רשלנות רפואית או נפילה במרחב הציבורי', hint: 'טיפול רפואי רשלני, איחור באבחון, החלקה או נפילה בשטח עירוני או בית עסק.' }
          ]
        },
        work_income: {
          badge: 'תעסוקה והכנסה',
          title: 'מצב תעסוקתי והכנסה חודשית',
          subtitle: 'הנתונים משמשים לבדיקת פטור ממס הכנסה (סעיף 9(5)), תביעות אובדן כושר עבודה ודמי פגיעה.',
          employmentTitle: 'מהו המצב התעסוקתי כיום?',
          employmentOptions: [
            { value: 'full_time', label: 'עבודה במשרה מלאה' },
            { value: 'part_time', label: 'עבודה במשרה חלקית' },
            { value: 'unemployed_medical', label: 'ללא עבודה בעקבות המצב הרפואי' },
            { value: 'unemployed_other', label: 'ללא עבודה מסיבה אחרת / גמלאות / שירות צבאי' }
          ],
          incomeTitle: 'מהי ההכנסה החודשית הממוצעת (ברוטו)?',
          incomeOptions: [
            { value: 'none', label: 'ללא הכנסה כרגע' },
            { value: 'up_to_8k', label: `עד ${formatILS(8000)}` },
            { value: '8k_15k', label: `${formatILS(8000)}–${formatILS(15000)}` },
            { value: '15k_25k', label: `${formatILS(15000)}–${formatILS(25000)}` },
            { value: 'over_25k', label: `מעל ${formatILS(25000)}` }
          ]
        },
        disability_percent: {
          badge: 'קביעות רפואיות קודמות',
          title: 'האם כבר נקבעו לכם אחוזי נכות רשמיים?',
          subtitle: 'הכוונה לוועדה רפואית של המוסד לביטוח לאומי, משרד הביטחון או מס הכנסה.',
          options: [
            { value: 'none', label: 'עדיין לא נקבעו אחוזי נכות' },
            { value: 'under_40', label: 'פחות מ־40%' },
            { value: '40_59', label: '40%–59%' },
            { value: '60_89', label: '60%–89%' },
            { value: '90_plus', label: '90% ומעלה (פוטנציאל גבוה לפטור ממס)' },
            { value: 'unknown', label: 'לא ידוע לי כרגע' }
          ]
        },
        incident_details: {
          badge: 'מועד והשלכות',
          title: 'מתי אירע המקרה ומה מידת ההשפעה שנותרה?',
          subtitle: 'מועד האירוע קריטי לבחינת התיישנות (7 שנים בנזיקין, 3 שנים בביטוח פרטי ו־12 חודשים בביטוח לאומי).',
          timingTitle: 'מתי אירע המקרה או מתי התגלתה הבעיה?',
          timingOptions: [
            { value: 'recent_days', label: 'בחודשים האחרונים (חלון פעולה קריטי)' },
            { value: 'under_1y', label: 'פחות משנה' },
            { value: '1_to_7y', label: 'לפני שנה עד 7 שנים' },
            { value: 'over_7y', label: 'לפני יותר מ־7 שנים' },
            { value: 'unknown', label: 'אין ודאות לגבי המועד המדויק' }
          ],
          residualTitle: 'האם נותרה מגבלה גופנית או נפשית מתמשכת?',
          residualOptions: [
            { value: 'significant', label: 'כן, פגיעה משמעותית בתפקוד או בעבודה' },
            { value: 'mild', label: 'כן, פגיעה קלה או כאבים מתמשכים' },
            { value: 'none', label: 'לא נותרה מגבלה קבועה' },
            { value: 'pending', label: 'עדיין בטיפולים וטרם התייצב המצב' }
          ]
        },
        docs_insurance: {
          badge: 'תיעוד וכיסויים',
          title: 'תיעוד רפואי ופוליסות ביטוח קיימות',
          subtitle: 'איסוף נכון של החומר מקצר את זמני הטיפול ומגדיל משמעותית את סיכויי ההצלחה.',
          docsTitle: 'איזה תיעוד רפואי קיים ברשותכם כיום?',
          docsOptions: [
            { value: 'full_docs', label: 'תיעוד מקיף (סיכומי אשפוז, בדיקות הדמיה MRI/CT ודוחות רופאים)' },
            { value: 'partial_docs', label: 'תיעוד חלקי בלבד (הפניות ראשוניות או סיכום ביקור)' },
            { value: 'no_docs', label: 'אין בידי תיעוד רפואי מסודר בשלב זה' }
          ],
          insuranceTitle: 'אילו כיסויי ביטוח קיימים לכם (מעבר לביטוח הבסיסי)?',
          insuranceOptions: [
            { value: 'work_pension', label: 'קרן פנסיה או ביטוח מנהלים פעיל' },
            { value: 'private_health_disability', label: 'ביטוח בריאות פרטי או פוליסת אובדן כושר עבודה' },
            { value: 'accident_life', label: 'ביטוח תאונות אישיות או ביטוח חיים' },
            { value: 'nursing_policy', label: 'ביטוח סיעודי (דרך קופת החולים או פרטי)' },
            { value: 'not_sure', label: 'לא ידוע לי בדיוק אילו כיסויים קיימים' }
          ]
        },
        medical_areas: {
          badge: 'תחומים רפואיים',
          title: 'באילו תחומים רפואיים מתבטאת הפגיעה?',
          subtitle: 'ניתן לבחור מספר תחומים — שקלול פגיעות רב־מערכתיות עשוי להוביל לאחוזי נכות משוקללים גבוהים במיוחד.',
          options: [
            { value: 'orthopedic', label: 'אורתופדיה (שברים, עמוד שדרה, מפרקים, צוואר וגב)' },
            { value: 'neurological', label: 'נוירולוגיה וכאב (נזק עצבי, ראש, ראש ומוח, פיברומיאלגיה)' },
            { value: 'psychological_ptsd', label: 'נפש ופוסט־טראומה (חרדות, דיכאון, PTSD, קשיי שינה)' },
            { value: 'internal_cardio', label: 'פנימי, לב וריאות (סוכרת, יתר לחץ דם, נשימה)' },
            { value: 'hearing_sight', label: 'שמיעה, ראייה וטינטון (פגיעה בחושים או צפצופים באוזניים)' },
            { value: 'skin_scarring', label: 'עור וצלקות (כוויות, צלקות מכאיבות או מגבילות תנועה)' }
          ]
        },
        representation: {
          badge: 'סטטוס משפטי',
          title: 'האם המקרה כבר מטופל על ידי גורם מקצועי?',
          subtitle: 'בדיקה האם כבר הוגשה תביעה או האם קיים ייצוג קיים בתיק.',
          options: [
            { value: 'none', label: 'לא, פניתי בעצמי או שטרם התחלתי בהליכים' },
            { value: 'lawyer_active', label: 'יש לי כרגע עורך דין פעיל בתיק' },
            { value: 'rejected_alone', label: 'הגשתי תביעה לבד והיא נדחתה או אושרה חלקית' },
            { value: 'consulted_only', label: 'התייעצתי בלבד אך לא חתמתי על ייצוג' }
          ]
        }
      }
    }
  };

  /**
   * Question flow definition
   */
  const QUESTIONS = [
    { id: 'contact', type: 'contact' },
    { id: 'demographics', type: 'demographics' },
    { id: 'causes', type: 'multi' },
    { id: 'work_income', type: 'dual_select' },
    { id: 'disability_percent', type: 'single' },
    { id: 'incident_details', type: 'dual_select' },
    { id: 'docs_insurance', type: 'dual_select' },
    { id: 'medical_areas', type: 'multi' },
    { id: 'representation', type: 'single' }
  ];

  /**
   * Smart Rights Evaluation Engine (Hebrew Native)
   */
  function evaluateRights(answers) {
    const tracks = [];
    const causes = Array.isArray(answers.causes) ? answers.causes : [];
    const medical = Array.isArray(answers.medical_areas) ? answers.medical_areas : [];
    const income = answers.income_bracket || 'none';
    const disability = answers.disability_percent || 'none';
    const timing = answers.timing || 'under_1y';
    const residual = answers.residual_impact || 'significant';
    const insurances = Array.isArray(answers.insurances) ? answers.insurances : [answers.insurances].filter(Boolean);

    // 1. תאונות דרכים
    if (causes.includes('road_accident')) {
      tracks.push({
        id: 'road_accident',
        title: 'תביעת פיצויים בגין תאונת דרכים (פלת״ד)',
        probability: 'likely',
        priority: 10,
        badge: 'זכאות ישירה על פי חוק',
        summary: 'חוק הפיצויים לנפגעי תאונות דרכים מקנה זכות לפיצוי ללא קשר למי אשם בתאונה. הפיצוי מגלם כאב וסבל, הפסדי שכר נוכחיים ועתידיים, הוצאות רפואיות ועזרת צד ג׳.',
        action: 'תיעוד רפואי רציף, שמירת אישור משטרה וייצוג מול חברת הביטוח לקבלת פיצוי מקסימלי.'
      });
    }

    // 2. תאונות עבודה
    if (causes.includes('work_injury')) {
      tracks.push({
        id: 'work_injury',
        title: 'תאונת עבודה וגמלאות נפגעי עבודה בביטוח לאומי',
        probability: 'likely',
        priority: 9,
        badge: 'דמי פגיעה + קצבת נכות',
        summary: 'הכרה כנפגע עבודה מאפשרת קבלת דמי פגיעה עבור עד 91 ימים, ומענק חד־פעמי או קצבה חודשית לכל החיים בהתאם לאחוזי הנכות שייקבעו בוועדה הרפואית.',
        action: 'הגשת תביעה לקביעת דרגת נכות מעבודה בליווי עורך דין כדי לוודא שכל הפגיעות מוכרות במלואן.'
      });
    }

    // 3. נפגעי פעולות איבה וטרור
    if (causes.includes('hostilities_terror')) {
      tracks.push({
        id: 'hostilities_terror',
        title: 'זכויות ותגמולים לנפגעי פעולות איבה',
        probability: 'likely',
        priority: 10,
        badge: 'מסלול מיוחד • משרד הביטחון',
        summary: 'נפגעי איבה זכאים להכרה, טיפולים רפואיים מלאים, תגמולים חודשיים, מענקי הבראה, סיוע בדיור ושיקום מקצועי לפי חוק התגמולים לנפגעי פעולות איבה.',
        action: 'איסוף מסמכי אירוע והגשת תביעה להכרה בוועדה המאשרת ובביטוח לאומי/משרד הביטחון.'
      });
    }

    // 4. משרד הביטחון וכוחות הביטחון
    if (causes.includes('defense_ministry')) {
      tracks.push({
        id: 'defense_ministry',
        title: 'תביעת נכות והכרה מול משרד הביטחון (אגף שיקום)',
        probability: 'likely',
        priority: 10,
        badge: 'חוק הנכים תגמולים ושיקום',
        summary: 'חיילי סדיר, מילואים ואנשי כוחות הביטחון שנפגעו או חלו עקב שירותם זכאים להכרה כנכי צה״ל, קצבאות חודשיות, מימון טיפולים ושיקום מקיף.',
        action: 'הגשת תביעה מסודרת לקצין התגמולים עם הוכחת קשר סיבתי מובהק בין השירות לפגיעה.'
      });
    }

    // 5. נכות כללית ושירותים מיוחדים (שר"מ)
    if (causes.includes('national_insurance') || disability === '40_59' || disability === '60_89' || disability === '90_plus' || residual === 'significant') {
      tracks.push({
        id: 'general_disability',
        title: 'קצבת נכות כללית ושירותים מיוחדים (שר״מ)',
        probability: (disability === '60_89' || disability === '90_plus' || residual === 'significant') ? 'likely' : 'possible',
        priority: 7,
        badge: 'ביטוח לאומי',
        summary: 'קצבה חודשית המשולמת למי שכושר השתכרותו צומצם ב־50% לפחות ונקבעו לו 60% נכות רפואית (או 40% עם סעיף ליקוי יחיד של 25%).',
        action: 'הכנת תיק רפואי משוקלל לכל הליקויים לקראת הוועדה הרפואית.'
      });
    }

    // 6. פטור ממס הכנסה (סעיף 9(5))
    if ((disability === '90_plus' || (causes.length >= 2 && medical.length >= 2)) && (income === '15k_25k' || income === 'over_25k' || income === '8k_15k')) {
      tracks.push({
        id: 'tax_exemption',
        title: 'פטור מלא ממס הכנסה לפי סעיף 9(5)',
        probability: disability === '90_plus' ? 'urgent' : 'possible',
        priority: 8,
        badge: 'חיסכון של עשרות אלפי ש״ח',
        summary: 'מי שנקבעת לו נכות רפואית משוקללת של 90% ומעלה לתקופה של 185 ימים ומעלה זכאי לפטור מלא ממס הכנסה על יגיעה אישית (כולל החזר רטרואקטיבי עד 6 שנים).',
        action: 'בניית שקלול נכויות אופטימלי והגשת בקשה לוועדה רפואית לפטור ממס.'
      });
    }

    // 7. תביעות ביטוח פרטי ואובדן כושר עבודה
    if (causes.includes('insurance_claims') || insurances.includes('private_health_disability') || insurances.includes('work_pension')) {
      tracks.push({
        id: 'private_insurance',
        title: 'תביעת פוליסת אובדן כושר עבודה וביטוחים פרטיים',
        probability: 'likely',
        priority: 8,
        badge: 'תשלום חודשי מפוליסה',
        summary: 'פוליסות מנהלים וקרנות פנסיה כוללות כיסוי לאובדן כושר עבודה בשיעור של עד 75% מהשכר המבוטח. חברות הביטוח נוטות להערים קשיים שניתן להתגבר עליהם בייצוג משפטי.',
        action: 'בדיקת תנאי הפוליסה והגשת תביעה מקצועית עם חוות דעת תעסוקתית מתאימה.'
      });
    }

    // 8. נזקי גוף ורשלנות
    if (causes.includes('medical_malpractice')) {
      tracks.push({
        id: 'tort_liability',
        title: 'תביעת נזקי גוף, רשלנות רפואית או חבות רשויות',
        probability: 'possible',
        priority: 7,
        badge: 'פקודת הנזיקין',
        summary: 'תביעות נזיקין בגין רשלנות רפואית או מפגעי בטיחות דורשות הוכחת רשלנות, קשר סיבתי וחוות דעת של רופא מומחה.',
        action: 'איסוף רשומות רפואיות מלאות והעברתן לבחינת מומחה רפואי בכיר.'
      });
    }

    // Fallback if nothing triggered
    if (tracks.length === 0) {
      tracks.push({
        id: 'general_consult',
        title: 'בדיקה פרטנית של מכלול הזכויות הרפואיות',
        probability: 'possible',
        priority: 5,
        badge: 'בדיקת כדאיות',
        summary: 'על בסיס המידע הראשוני, מומלץ לבצע בדיקת עומק של התיק מול שותפי המשרד כדי לאתר זכויות פוטנציאליות בביטוח לאומי ובחברות הביטוח.',
        action: 'קביעת שיחת ייעוץ ראשונית ללא עלות לבחינת האפשרויות המשפטיות.'
      });
    }

    tracks.sort((a, b) => b.priority - a.priority);

    const highPriorityCount = tracks.filter((t) => t.probability === 'likely' || t.probability === 'urgent').length;

    let warning = null;
    if (timing === '1_to_7y') {
      warning = 'שימו לב: תקופת ההתיישנות בנזיקין היא 7 שנים, ובפוליסות ביטוח פרטיות 3 שנים בלבד. מומלץ לפעול ללא דיחוי כדי לא לאבד את הזכויות.';
    } else if (timing === 'over_7y') {
      warning = 'במקרים שחלפו מעל 7 שנים נדרשת בדיקת חריגים (כגון קטינות במועד האירוע, גילוי מאוחר או החמרת מצב).';
    }

    return {
      tracks,
      totalCount: tracks.length,
      highPriorityCount,
      warning,
      consultationFee: 'ללא עלות'
    };
  }

  // Export to window
  window.RIGHTS_I18N = I18N;
  window.RIGHTS_QUESTIONS = QUESTIONS;
  window.evaluateRights = evaluateRights;
  window.BLS_FIRM_CONFIG = {
    firmName: 'בן לולו סיבוני · משרד עורכי דין',
    phone: '08-635-3956',
    phoneDial: '086353956',
    email: 'office@blslaw.co.il',
    whatsappNumber: '97286353956',
    address: 'יונה הנביא 2, משרד 105, אשדוד',
    siteUrl: 'https://www.blslaw.co.il/',
    webhookUrl: ''
  };
})();
