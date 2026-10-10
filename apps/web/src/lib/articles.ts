import type { Locale } from "@ix/i18n";

/**
 * Articles on the public site. Each one exists in both languages. They explain how we work
 * and what we have learned; they state no client results, prices or percentages.
 */

export interface ArticleCopy {
  readonly title: string;
  /** One or two sentences: the answer the article gives. Used as the meta description. */
  readonly description: string;
  readonly sections: readonly { readonly heading: string; readonly paragraphs: readonly string[] }[];
  readonly takeaways: readonly string[];
}

export interface Article {
  readonly slug: string;
  /** ISO date of publication. */
  readonly date: string;
  readonly minutes: number;
  /** Where the closing link of the article points, as a path without the locale. */
  readonly next: "/assessment" | "/work" | "/services";
  readonly copy: Readonly<Record<Locale, ArticleCopy>>;
}

export const ARTICLES: readonly Article[] = [
  {
    slug: "ai-agent-or-automation",
    date: "2026-10-11",
    minutes: 4,
    next: "/assessment",
    copy: {
      en: {
        title: "AI agent or automation: which one does your business need?",
        description:
          "Automation follows rules you can write down. An AI agent handles work that needs reading, judging and wording. Most companies need automation first, and an agent only where the rules run out.",
        sections: [
          {
            heading: "The short answer",
            paragraphs: [
              "If you can describe the work as “when this happens, do that”, you need automation. If the work starts with a message, a document or a photo that someone has to read and understand first, you need an AI agent in front of the automation.",
              "The two are not rivals. In a system that works, the agent reads and recommends, and a fixed workflow carries out the action. The agent is the part that thinks. The workflow is the part you can trust to do the same thing every time.",
            ],
          },
          {
            heading: "What automation is good at",
            paragraphs: [
              "Automation moves data between systems, sends reminders, creates records, chases approvals and produces documents. It does not get tired and it does not improvise, which is exactly why it is safe. A workflow that sends an appointment reminder will send it the same way the thousandth time as the first.",
              "Its limit is that it only knows the cases you wrote down. A customer who writes “can I come a bit later, my car is still at the other garage” does not match any rule.",
            ],
          },
          {
            heading: "What an AI agent adds",
            paragraphs: [
              "An agent can read that message, understand that it is a request to reschedule, check what is free and answer in the customer’s own language. It turns unstructured input into something a workflow can act on.",
              "Its limit is the opposite one: it can be wrong in a confident voice. That is why an agent should not be the one to issue a refund, sign a contract or change a price. It prepares the action, and a rule or a person approves it.",
            ],
          },
          {
            heading: "How to decide for one process",
            paragraphs: [
              "Take one process and ask three questions. Does it start with free text, voice or images? Do the cases vary too much to list? Does the answer need to be worded for a person? Three times no means plain automation. A yes on any of them means an agent belongs at that step, and only at that step.",
              "Then ask a fourth question about every action at the end: what happens if this is wrong? If the answer is “we lose money or trust”, a person approves it.",
            ],
          },
        ],
        takeaways: [
          "Rules you can write down: automation.",
          "Reading, judging and wording: an AI agent.",
          "The agent recommends, the workflow acts, and a person approves what is risky.",
        ],
      },
      ar: {
        title: "وكيل ذكاء اصطناعي أم أتمتة: أيهما تحتاج شركتك؟",
        description:
          "الأتمتة تنفّذ قواعد يمكن كتابتها. ووكيل الذكاء الاصطناعي يتولى العمل الذي يحتاج قراءة وتقديرًا وصياغة. معظم الشركات تحتاج الأتمتة أولًا، والوكيل فقط حيث تنتهي القواعد.",
        sections: [
          {
            heading: "الإجابة المختصرة",
            paragraphs: [
              "إذا أمكنك وصف العمل بعبارة «عندما يحدث كذا، افعل كذا» فأنت تحتاج أتمتة. وإذا كان العمل يبدأ برسالة أو مستند أو صورة يجب أن يقرأها أحد ويفهمها أولًا، فأنت تحتاج وكيل ذكاء اصطناعي قبل الأتمتة.",
              "الاثنان ليسا متنافسين. في النظام الذي يعمل جيدًا، الوكيل يقرأ ويوصي، ومسار عمل ثابت ينفّذ الإجراء. الوكيل هو الجزء الذي يفكّر، والمسار هو الجزء الذي تثق أنه يفعل الشيء نفسه كل مرة.",
            ],
          },
          {
            heading: "ما الذي تجيده الأتمتة",
            paragraphs: [
              "الأتمتة تنقل البيانات بين الأنظمة، وترسل التذكيرات، وتنشئ السجلات، وتلاحق الموافقات، وتصدر المستندات. لا تتعب ولا ترتجل، ولهذا بالذات هي آمنة. المسار الذي يرسل تذكيرًا بالموعد يرسله في المرة الألف كما أرسله في المرة الأولى.",
              "وحدّها أنها لا تعرف إلا الحالات التي كتبتها لها. عميل يكتب «هل أستطيع أن آتي متأخرًا قليلًا، سيارتي ما زالت في الورشة الأخرى» لا تنطبق عليه أي قاعدة.",
            ],
          },
          {
            heading: "ما الذي يضيفه وكيل الذكاء الاصطناعي",
            paragraphs: [
              "الوكيل يقرأ تلك الرسالة، ويفهم أنها طلب تغيير موعد، ويتحقق من المواعيد المتاحة، ويردّ بلغة العميل نفسها. إنه يحوّل المدخلات غير المنظّمة إلى شيء يستطيع مسار العمل تنفيذه.",
              "وحدّه معاكس: قد يخطئ بنبرة واثقة. لذلك لا ينبغي أن يكون الوكيل هو من يصدر استردادًا أو يوقّع عقدًا أو يغيّر سعرًا. هو يجهّز الإجراء، وقاعدة أو إنسان يعتمده.",
            ],
          },
          {
            heading: "كيف تقرّر لعملية واحدة",
            paragraphs: [
              "خذ عملية واحدة واسأل ثلاثة أسئلة. هل تبدأ بنص حر أو صوت أو صور؟ هل تتنوع الحالات أكثر من أن تُحصى؟ هل تحتاج الإجابة إلى صياغة موجّهة لإنسان؟ ثلاث مرات «لا» تعني أتمتة عادية. و«نعم» في أي منها تعني أن الوكيل مكانه عند تلك الخطوة، وعندها فقط.",
              "ثم اسأل سؤالًا رابعًا عن كل إجراء في النهاية: ماذا يحدث لو كان خطأً؟ إذا كانت الإجابة «نخسر مالًا أو ثقة» فالاعتماد لإنسان.",
            ],
          },
        ],
        takeaways: [
          "قواعد يمكن كتابتها: أتمتة.",
          "قراءة وتقدير وصياغة: وكيل ذكاء اصطناعي.",
          "الوكيل يوصي، والمسار ينفّذ، والإنسان يعتمد ما فيه مخاطرة.",
        ],
      },
    },
  },
  {
    slug: "what-to-automate-first",
    date: "2026-10-11",
    minutes: 4,
    next: "/assessment",
    copy: {
      en: {
        title: "What to automate first: a simple way to choose",
        description:
          "Start with the process that is repeated often, follows clear rules and hurts when it is late. Automate one process end to end before starting a second.",
        sections: [
          {
            heading: "The short answer",
            paragraphs: [
              "Pick the process that scores highest on three things: how often it is repeated, how clear its rules are, and how much a delay costs you. Leave the rare, the fuzzy and the harmless for later.",
              "Most companies start in the wrong place. They automate what is interesting, or what the newest tool makes easy, instead of what the business actually waits on every day.",
            ],
          },
          {
            heading: "List the work, not the tools",
            paragraphs: [
              "Write down what your team does repeatedly in a normal week: answering the same enquiries, copying orders into another system, sending quotations, reminding customers, preparing the same report. Do not mention software yet.",
              "Next to each item write three things: roughly how many times a week it happens, whether a new employee could do it from a one-page instruction, and what goes wrong when it is done late.",
            ],
          },
          {
            heading: "The three tests",
            paragraphs: [
              "Frequency: something done many times a day pays back sooner than something done once a month, however painful the monthly task feels.",
              "Clarity: if two of your own people would handle the same case differently, the process is not ready to automate. Agree the rule first. Automation makes a clear process fast and a confused process confusing at speed.",
              "Cost of delay: an enquiry answered tomorrow may be a customer lost. A report delivered tomorrow is usually just a report delivered tomorrow.",
            ],
          },
          {
            heading: "Finish one before starting two",
            paragraphs: [
              "Automate one process from its first step to its last, including what happens when something fails. A workflow that works on a good day and stops silently on a bad one is worse than doing the work by hand, because nobody is watching it any more.",
              "When the first process has run for a few weeks without surprises, the second one is easier: the connections to your systems already exist and your team has seen what to expect.",
            ],
          },
        ],
        takeaways: [
          "Choose by frequency, clarity of rules and cost of delay.",
          "Agree the rule before you automate it.",
          "One process end to end, with failure handling, before the next.",
        ],
      },
      ar: {
        title: "ما الذي تؤتمته أولًا: طريقة بسيطة للاختيار",
        description:
          "ابدأ بالعملية التي تتكرر كثيرًا، وتسير على قواعد واضحة، ويؤلمك تأخّرها. وأتمت عملية واحدة من أولها إلى آخرها قبل أن تبدأ الثانية.",
        sections: [
          {
            heading: "الإجابة المختصرة",
            paragraphs: [
              "اختر العملية الأعلى في ثلاثة أمور: كم مرة تتكرر، وما مدى وضوح قواعدها، وكم يكلّفك تأخّرها. واترك النادر والغامض وغير المؤذي لوقت لاحق.",
              "معظم الشركات تبدأ من المكان الخطأ. تؤتمت ما هو ممتع، أو ما تجعله أحدث أداة سهلًا، بدل ما تنتظره الشركة فعلًا كل يوم.",
            ],
          },
          {
            heading: "اكتب قائمة بالعمل لا بالأدوات",
            paragraphs: [
              "اكتب ما يفعله فريقك بتكرار في أسبوع عادي: الرد على الاستفسارات نفسها، نسخ الطلبات إلى نظام آخر، إرسال عروض الأسعار، تذكير العملاء، إعداد التقرير نفسه. ولا تذكر أي برنامج الآن.",
              "وبجانب كل بند اكتب ثلاثة أشياء: كم مرة يحدث في الأسبوع تقريبًا، وهل يستطيع موظف جديد تنفيذه من ورقة تعليمات واحدة، وما الذي يسوء حين يتأخر.",
            ],
          },
          {
            heading: "الاختبارات الثلاثة",
            paragraphs: [
              "التكرار: ما يُنفَّذ مرات كثيرة في اليوم يعود بفائدته أسرع مما يُنفَّذ مرة في الشهر، مهما بدت المهمة الشهرية مزعجة.",
              "الوضوح: إذا كان اثنان من موظفيك سيتعاملان مع الحالة نفسها بطريقتين مختلفتين، فالعملية ليست جاهزة للأتمتة. اتفقوا على القاعدة أولًا. الأتمتة تجعل العملية الواضحة سريعة، وتجعل العملية المرتبكة مرتبكة بسرعة.",
              "تكلفة التأخير: استفسار يُجاب غدًا قد يكون عميلًا ضاع. أما تقرير يُسلَّم غدًا فهو في الغالب مجرد تقرير سُلِّم غدًا.",
            ],
          },
          {
            heading: "أكمل واحدة قبل أن تبدأ اثنتين",
            paragraphs: [
              "أتمت عملية واحدة من خطوتها الأولى إلى الأخيرة، ومن ضمنها ما يحدث عند الفشل. المسار الذي يعمل في اليوم الجيد ويتوقف بصمت في اليوم السيئ أسوأ من العمل اليدوي، لأن أحدًا لم يعد يراقبه.",
              "وحين تعمل العملية الأولى أسابيع دون مفاجآت، تصبح الثانية أسهل: الربط مع أنظمتك موجود، وفريقك رأى ما الذي يتوقعه.",
            ],
          },
        ],
        takeaways: [
          "اختر بالتكرار ووضوح القواعد وتكلفة التأخير.",
          "اتفق على القاعدة قبل أن تؤتمتها.",
          "عملية واحدة كاملة، مع معالجة الفشل، قبل التالية.",
        ],
      },
    },
  },
  {
    slug: "why-the-technician-still-signs",
    date: "2026-10-11",
    minutes: 5,
    next: "/work",
    copy: {
      en: {
        title: "Why the technician still signs: lessons from AI in a vehicle inspection centre",
        description:
          "In the SCANNO inspection platform, AI drafts the report and a technician approves it. Running it on real cars showed where AI goes wrong, and why the approval step is the product and not a formality.",
        sections: [
          {
            heading: "The short answer",
            paragraphs: [
              "AI is fast at organising what a technician found and writing it clearly. It is not the one who looked at the car. So in the platform we built for SCANNO, a vehicle inspection centre in Doha, the AI proposes and the technician decides, and no report reaches a customer without a technician’s approval.",
              "That rule did not come from caution alone. It came from what we saw when real inspections started running through the system.",
            ],
          },
          {
            heading: "What went wrong, and what we changed",
            paragraphs: [
              "The AI mixed up left and right when reading photos. A scratch on the left door is not a small error when it is written as the right door. We stopped it from writing the side at all, and left that to the technician.",
              "One technician’s phone was sending photos to the model rotated. No lab test had shown it, because our test photos were upright. We found it by reviewing a real inspection.",
              "Two technicians inspected the same car at the same time and produced two different reports. The system now warns before the analysis starts.",
              "On a car whose computer had been replaced, the diagnostic device read a chassis number different from the one the technician had typed. Comparing the two became an automatic check.",
              "The customer assistant wrote the centre’s name wrongly in Arabic, because its instructions were written in English. We added a guard on the name.",
            ],
          },
          {
            heading: "The guardrails that matter most",
            paragraphs: [
              "A section that was not inspected is written as “not assessed”. An AI asked for a full report will happily fill an empty section with something plausible, and a plausible sentence about brakes nobody checked is the worst thing an inspection report can contain.",
              "A photo is evidence only for its own section. Scores are suggestions that the technician can change, with a written reason. And the assistant that answers customers gives no prices, no repair times and no opinion on whether to buy the car.",
            ],
          },
          {
            heading: "What this means for your own project",
            paragraphs: [
              "If AI is going to write something your customer relies on, decide before you build who signs it. Then design the screen around that person: make it quick to accept what is right and easy to reject what is wrong.",
              "And review real work after launch, every case at first. The problems above were all found that way, not in testing.",
            ],
          },
        ],
        takeaways: [
          "AI drafts, a qualified person approves.",
          "Make the AI say “not assessed” instead of guessing.",
          "Review every real case after launch: that is where the problems show.",
        ],
      },
      ar: {
        title: "لماذا ما زال الفني يوقّع: دروس من الذكاء الاصطناعي في مركز لفحص السيارات",
        description:
          "في منصة فحص SCANNO، الذكاء الاصطناعي يكتب مسودة التقرير والفني يعتمدها. تشغيلها على سيارات حقيقية أظهر أين يخطئ الذكاء الاصطناعي، ولماذا خطوة الاعتماد هي المنتج نفسه لا مجرد إجراء.",
        sections: [
          {
            heading: "الإجابة المختصرة",
            paragraphs: [
              "الذكاء الاصطناعي سريع في تنظيم ما وجده الفني وكتابته بوضوح. لكنه ليس من نظر إلى السيارة. لذلك في المنصة التي بنيناها لـ SCANNO، مركز فحص السيارات في الدوحة، الذكاء الاصطناعي يقترح والفني يقرّر، ولا يصل أي تقرير إلى العميل دون اعتماد فني.",
              "هذه القاعدة لم تأتِ من الحذر وحده. جاءت مما رأيناه حين بدأت الفحوصات الحقيقية تمر عبر النظام.",
            ],
          },
          {
            heading: "ما الذي أخطأ، وما الذي غيّرناه",
            paragraphs: [
              "الذكاء الاصطناعي خلط بين اليمين واليسار عند قراءة الصور. خدش في الباب الأيسر ليس خطأً صغيرًا حين يُكتب على أنه في الباب الأيمن. فمنعناه من كتابة الجهة أصلًا وتركناها للفني.",
              "هاتف أحد الفنيين كان يرسل الصور مائلة إلى النموذج. لم يُظهر ذلك أي اختبار معملي، لأن صور الاختبار كانت معتدلة. اكتشفناه من مراجعة فحص حقيقي.",
              "فنّيان فحصا السيارة نفسها في الوقت نفسه وخرجا بتقريرين مختلفين. والآن ينبّه النظام قبل بدء التحليل.",
              "في سيارة استُبدل كمبيوترها، قرأ جهاز الأعطال رقم هيكل يختلف عمّا كتبه الفني. فصارت المقارنة بين الرقمين فحصًا تلقائيًا.",
              "مساعد العملاء كتب اسم المركز خطأً بالعربية، لأن تعليماته مكتوبة بالإنجليزية. فأضفنا حارسًا على الاسم.",
            ],
          },
          {
            heading: "أهم الضوابط",
            paragraphs: [
              "القسم الذي لم يُفحص يُكتب «لم يُقيَّم». الذكاء الاصطناعي حين يُطلب منه تقرير كامل يملأ القسم الفارغ بكلام معقول دون تردد، وجملة معقولة عن فرامل لم يفحصها أحد هي أسوأ ما يمكن أن يحتويه تقرير فحص.",
              "الصورة دليل لقسمها فقط. والدرجات اقتراح يستطيع الفني تعديله مع سبب مكتوب. والمساعد الذي يجيب العملاء لا يذكر أسعارًا ولا مدة إصلاح ولا رأيًا في شراء السيارة.",
            ],
          },
          {
            heading: "ما معنى ذلك لمشروعك",
            paragraphs: [
              "إذا كان الذكاء الاصطناعي سيكتب شيئًا يعتمد عليه عميلك، فقرّر قبل البناء من الذي يوقّع عليه. ثم صمّم الشاشة حول هذا الشخص: اجعل قبول الصحيح سريعًا ورفض الخطأ سهلًا.",
              "وراجع العمل الحقيقي بعد الإطلاق، كل حالة في البداية. المشاكل المذكورة أعلاه كلها اكتُشفت بهذه الطريقة، لا في الاختبار.",
            ],
          },
        ],
        takeaways: [
          "الذكاء الاصطناعي يكتب المسودة، وشخص مؤهل يعتمد.",
          "اجعل الذكاء الاصطناعي يقول «لم يُقيَّم» بدل أن يخمّن.",
          "راجع كل حالة حقيقية بعد الإطلاق: هناك تظهر المشاكل.",
        ],
      },
    },
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
