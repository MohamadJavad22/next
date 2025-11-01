// استان‌ها و شهرهای ایران

export interface City {
  id: number;
  name: string;
  slug: string;
  province_id: number;
}

export interface Province {
  id: number;
  name: string;
  slug: string;
}

export const provinces: Province[] = [
  { id: 1, name: 'آذربایجان شرقی', slug: 'azarbayjan-sharghi' },
  { id: 2, name: 'آذربایجان غربی', slug: 'azarbayjan-gharbi' },
  { id: 3, name: 'اردبیل', slug: 'ardabil' },
  { id: 4, name: 'اصفهان', slug: 'esfahan' },
  { id: 5, name: 'البرز', slug: 'alborz' },
  { id: 6, name: 'ایلام', slug: 'ilam' },
  { id: 7, name: 'بوشهر', slug: 'bushehr' },
  { id: 8, name: 'تهران', slug: 'tehran' },
  { id: 9, name: 'چهارمحال و بختیاری', slug: 'chaharmahal-bakhtiari' },
  { id: 10, name: 'خراسان جنوبی', slug: 'khorasan-jonubi' },
  { id: 11, name: 'خراسان رضوی', slug: 'khorasan-razavi' },
  { id: 12, name: 'خراسان شمالی', slug: 'khorasan-shomali' },
  { id: 13, name: 'خوزستان', slug: 'khuzestan' },
  { id: 14, name: 'زنجان', slug: 'zanjan' },
  { id: 15, name: 'سمنان', slug: 'semnan' },
  { id: 16, name: 'سیستان و بلوچستان', slug: 'sistan-baluchestan' },
  { id: 17, name: 'فارس', slug: 'fars' },
  { id: 18, name: 'قزوین', slug: 'qazvin' },
  { id: 19, name: 'قم', slug: 'qom' },
  { id: 20, name: 'کردستان', slug: 'kordestan' },
  { id: 21, name: 'کرمان', slug: 'kerman' },
  { id: 22, name: 'کرمانشاه', slug: 'kermanshah' },
  { id: 23, name: 'کهگیلویه و بویراحمد', slug: 'kohgiluyeh-boyerahmad' },
  { id: 24, name: 'گلستان', slug: 'golestan' },
  { id: 25, name: 'گیلان', slug: 'gilan' },
  { id: 26, name: 'لرستان', slug: 'lorestan' },
  { id: 27, name: 'مازندران', slug: 'mazandaran' },
  { id: 28, name: 'مرکزی', slug: 'markazi' },
  { id: 29, name: 'هرمزگان', slug: 'hormozgan' },
  { id: 30, name: 'همدان', slug: 'hamadan' },
  { id: 31, name: 'یزد', slug: 'yazd' },
];

export const cities: City[] = [
  // آذربایجان شرقی
  { id: 1, name: 'تبریز', slug: 'tabriz', province_id: 1 },
  { id: 2, name: 'مراغه', slug: 'maragheh', province_id: 1 },
  { id: 3, name: 'مرند', slug: 'marand', province_id: 1 },
  { id: 4, name: 'میانه', slug: 'miyaneh', province_id: 1 },
  { id: 5, name: 'شبستر', slug: 'shabestar', province_id: 1 },
  { id: 6, name: 'بناب', slug: 'bonab', province_id: 1 },
  { id: 7, name: 'سراب', slug: 'sarab', province_id: 1 },
  { id: 8, name: 'اهر', slug: 'ahar', province_id: 1 },
  { id: 9, name: 'هریس', slug: 'heris', province_id: 1 },
  { id: 10, name: 'جلفا', slug: 'jolfa', province_id: 1 },

  // آذربایجان غربی
  { id: 11, name: 'ارومیه', slug: 'urmia', province_id: 2 },
  { id: 12, name: 'خوی', slug: 'khoy', province_id: 2 },
  { id: 13, name: 'مهاباد', slug: 'mahabad', province_id: 2 },
  { id: 14, name: 'بوکان', slug: 'bukan', province_id: 2 },
  { id: 15, name: 'سلماس', slug: 'salmas', province_id: 2 },
  { id: 16, name: 'میاندوآب', slug: 'miandoab', province_id: 2 },
  { id: 17, name: 'نقده', slug: 'naghadeh', province_id: 2 },
  { id: 18, name: 'پیرانشهر', slug: 'piranshahr', province_id: 2 },
  { id: 19, name: 'سردشت', slug: 'sardasht', province_id: 2 },
  { id: 20, name: 'تکاب', slug: 'takab', province_id: 2 },

  // اردبیل
  { id: 21, name: 'اردبیل', slug: 'ardabil', province_id: 3 },
  { id: 22, name: 'خلخال', slug: 'khalkhal', province_id: 3 },
  { id: 23, name: 'پارس‌آباد', slug: 'parsabad', province_id: 3 },
  { id: 24, name: 'مشگین‌شهر', slug: 'meshginshahr', province_id: 3 },
  { id: 25, name: 'نمین', slug: 'namin', province_id: 3 },
  { id: 26, name: 'نیر', slug: 'nir', province_id: 3 },
  { id: 27, name: 'سرعین', slug: 'sarein', province_id: 3 },
  { id: 28, name: 'گرمی', slug: 'germi', province_id: 3 },

  // اصفهان
  { id: 29, name: 'اصفهان', slug: 'esfahan', province_id: 4 },
  { id: 30, name: 'کاشان', slug: 'kashan', province_id: 4 },
  { id: 31, name: 'نجف‌آباد', slug: 'najafabad', province_id: 4 },
  { id: 32, name: 'خمینی‌شهر', slug: 'khomeinishahr', province_id: 4 },
  { id: 33, name: 'شاهین‌شهر', slug: 'shahinshahr', province_id: 4 },
  { id: 34, name: 'فلاورجان', slug: 'falavarjan', province_id: 4 },
  { id: 35, name: 'گلپایگان', slug: 'golpayegan', province_id: 4 },
  { id: 36, name: 'خوانسار', slug: 'khvansar', province_id: 4 },
  { id: 37, name: 'نطنز', slug: 'natanz', province_id: 4 },
  { id: 38, name: 'شهرضا', slug: 'shahreza', province_id: 4 },
  { id: 39, name: 'اردستان', slug: 'ardestan', province_id: 4 },
  { id: 40, name: 'نائین', slug: 'naein', province_id: 4 },
  { id: 41, name: 'فریدن', slug: 'fereydan', province_id: 4 },
  { id: 42, name: 'سمیرم', slug: 'semirom', province_id: 4 },

  // البرز
  { id: 43, name: 'کرج', slug: 'karaj', province_id: 5 },
  { id: 44, name: 'نظرآباد', slug: 'nazarabad', province_id: 5 },
  { id: 45, name: 'فردیس', slug: 'fardis', province_id: 5 },
  { id: 46, name: 'هشتگرد', slug: 'hashtgerd', province_id: 5 },
  { id: 47, name: 'ماهدشت', slug: 'mahdasht', province_id: 5 },
  { id: 48, name: 'اشتهارد', slug: 'eshtehard', province_id: 5 },
  { id: 49, name: 'طالقان', slug: 'taleqan', province_id: 5 },

  // ایلام
  { id: 50, name: 'ایلام', slug: 'ilam', province_id: 6 },
  { id: 51, name: 'دهلران', slug: 'dehloran', province_id: 6 },
  { id: 52, name: 'آبدانان', slug: 'abdanan', province_id: 6 },
  { id: 53, name: 'ایوان', slug: 'ivan', province_id: 6 },
  { id: 54, name: 'دره‌شهر', slug: 'dareshahr', province_id: 6 },
  { id: 55, name: 'مهران', slug: 'mehran', province_id: 6 },

  // بوشهر
  { id: 56, name: 'بوشهر', slug: 'bushehr', province_id: 7 },
  { id: 57, name: 'برازجان', slug: 'borazjan', province_id: 7 },
  { id: 58, name: 'گناوه', slug: 'genaveh', province_id: 7 },
  { id: 59, name: 'دیر', slug: 'deyr', province_id: 7 },
  { id: 60, name: 'کنگان', slug: 'kangan', province_id: 7 },
  { id: 61, name: 'دیلم', slug: 'deylam', province_id: 7 },
  { id: 62, name: 'جم', slug: 'jam', province_id: 7 },

  // تهران
  { id: 63, name: 'تهران', slug: 'tehran', province_id: 8 },
  { id: 64, name: 'ری', slug: 'rey', province_id: 8 },
  { id: 65, name: 'شهریار', slug: 'shahriar', province_id: 8 },
  { id: 66, name: 'اسلامشهر', slug: 'eslamshahr', province_id: 8 },
  { id: 67, name: 'ورامین', slug: 'varamin', province_id: 8 },
  { id: 68, name: 'رباط‌کریم', slug: 'robatkarim', province_id: 8 },
  { id: 69, name: 'دماوند', slug: 'damavand', province_id: 8 },
  { id: 70, name: 'پاکدشت', slug: 'pakdasht', province_id: 8 },
  { id: 71, name: 'قدس', slug: 'qods', province_id: 8 },
  { id: 72, name: 'ملارد', slug: 'malard', province_id: 8 },
  { id: 73, name: 'پردیس', slug: 'pardis', province_id: 8 },
  { id: 74, name: 'فیروزکوه', slug: 'firuzkooh', province_id: 8 },

  // چهارمحال و بختیاری
  { id: 75, name: 'شهرکرد', slug: 'shahrekord', province_id: 9 },
  { id: 76, name: 'بروجن', slug: 'boroujen', province_id: 9 },
  { id: 77, name: 'فارسان', slug: 'farsan', province_id: 9 },
  { id: 78, name: 'لردگان', slug: 'lordegan', province_id: 9 },
  { id: 79, name: 'اردل', slug: 'ardal', province_id: 9 },

  // خراسان جنوبی
  { id: 80, name: 'بیرجند', slug: 'birjand', province_id: 10 },
  { id: 81, name: 'قائن', slug: 'qaen', province_id: 10 },
  { id: 82, name: 'فردوس', slug: 'ferdows', province_id: 10 },
  { id: 83, name: 'طبس', slug: 'tabas', province_id: 10 },
  { id: 84, name: 'نهبندان', slug: 'nehbandan', province_id: 10 },

  // خراسان رضوی
  { id: 85, name: 'مشهد', slug: 'mashhad', province_id: 11 },
  { id: 86, name: 'نیشابور', slug: 'neyshabur', province_id: 11 },
  { id: 87, name: 'سبزوار', slug: 'sabzevar', province_id: 11 },
  { id: 88, name: 'تربت حیدریه', slug: 'torbat-heydariyeh', province_id: 11 },
  { id: 89, name: 'قوچان', slug: 'quchan', province_id: 11 },
  { id: 90, name: 'گناباد', slug: 'gonabad', province_id: 11 },
  { id: 91, name: 'کاشمر', slug: 'kashmar', province_id: 11 },
  { id: 92, name: 'تربت جام', slug: 'torbat-jam', province_id: 11 },
  { id: 93, name: 'چناران', slug: 'chenaran', province_id: 11 },
  { id: 94, name: 'خواف', slug: 'khaf', province_id: 11 },
  { id: 95, name: 'تایباد', slug: 'taybad', province_id: 11 },

  // خراسان شمالی
  { id: 96, name: 'بجنورد', slug: 'bojnurd', province_id: 12 },
  { id: 97, name: 'شیروان', slug: 'shirvan', province_id: 12 },
  { id: 98, name: 'اسفراین', slug: 'esfarayen', province_id: 12 },
  { id: 99, name: 'جاجرم', slug: 'jajarm', province_id: 12 },
  { id: 100, name: 'فاروج', slug: 'faruj', province_id: 12 },

  // خوزستان
  { id: 101, name: 'اهواز', slug: 'ahvaz', province_id: 13 },
  { id: 102, name: 'آبادان', slug: 'abadan', province_id: 13 },
  { id: 103, name: 'دزفول', slug: 'dezful', province_id: 13 },
  { id: 104, name: 'خرمشهر', slug: 'khorramshahr', province_id: 13 },
  { id: 105, name: 'اندیمشک', slug: 'andimeshk', province_id: 13 },
  { id: 106, name: 'بهبهان', slug: 'behbahan', province_id: 13 },
  { id: 107, name: 'ایذه', slug: 'izeh', province_id: 13 },
  { id: 108, name: 'ماهشهر', slug: 'mahshahr', province_id: 13 },
  { id: 109, name: 'شوشتر', slug: 'shushtar', province_id: 13 },
  { id: 110, name: 'شوش', slug: 'shush', province_id: 13 },
  { id: 111, name: 'رامهرمز', slug: 'ramhormoz', province_id: 13 },
  { id: 112, name: 'باغملک', slug: 'baghmalek', province_id: 13 },

  // زنجان
  { id: 113, name: 'زنجان', slug: 'zanjan', province_id: 14 },
  { id: 114, name: 'ابهر', slug: 'abhar', province_id: 14 },
  { id: 115, name: 'خدابنده', slug: 'khodabandeh', province_id: 14 },
  { id: 116, name: 'خرمدره', slug: 'khorramdareh', province_id: 14 },
  { id: 117, name: 'ماهنشان', slug: 'mahneshan', province_id: 14 },

  // سمنان
  { id: 118, name: 'سمنان', slug: 'semnan', province_id: 15 },
  { id: 119, name: 'شاهرود', slug: 'shahroud', province_id: 15 },
  { id: 120, name: 'دامغان', slug: 'damghan', province_id: 15 },
  { id: 121, name: 'گرمسار', slug: 'garmsar', province_id: 15 },
  { id: 122, name: 'مهدی‌شهر', slug: 'mehdishahr', province_id: 15 },

  // سیستان و بلوچستان
  { id: 123, name: 'زاهدان', slug: 'zahedan', province_id: 16 },
  { id: 124, name: 'زابل', slug: 'zabol', province_id: 16 },
  { id: 125, name: 'چابهار', slug: 'chabahar', province_id: 16 },
  { id: 126, name: 'ایرانشهر', slug: 'iranshahr', province_id: 16 },
  { id: 127, name: 'خاش', slug: 'khash', province_id: 16 },
  { id: 128, name: 'سراوان', slug: 'saravan', province_id: 16 },
  { id: 129, name: 'نیکشهر', slug: 'nikshahr', province_id: 16 },

  // فارس
  { id: 130, name: 'شیراز', slug: 'shiraz', province_id: 17 },
  { id: 131, name: 'مرودشت', slug: 'marvdasht', province_id: 17 },
  { id: 132, name: 'جهرم', slug: 'jahrom', province_id: 17 },
  { id: 133, name: 'فسا', slug: 'fasa', province_id: 17 },
  { id: 134, name: 'کازرون', slug: 'kazerun', province_id: 17 },
  { id: 135, name: 'لار', slug: 'lar', province_id: 17 },
  { id: 136, name: 'داراب', slug: 'darab', province_id: 17 },
  { id: 137, name: 'آباده', slug: 'abadeh', province_id: 17 },
  { id: 138, name: 'اقلید', slug: 'eghlid', province_id: 17 },
  { id: 139, name: 'نی‌ریز', slug: 'neyriz', province_id: 17 },

  // قزوین
  { id: 140, name: 'قزوین', slug: 'qazvin', province_id: 18 },
  { id: 141, name: 'تاکستان', slug: 'takestan', province_id: 18 },
  { id: 142, name: 'آبیک', slug: 'abyek', province_id: 18 },
  { id: 143, name: 'بوئین‌زهرا', slug: 'buin-zahra', province_id: 18 },
  { id: 144, name: 'الوند', slug: 'alvand', province_id: 18 },

  // قم
  { id: 145, name: 'قم', slug: 'qom', province_id: 19 },

  // کردستان
  { id: 146, name: 'سنندج', slug: 'sanandaj', province_id: 20 },
  { id: 147, name: 'مریوان', slug: 'marivan', province_id: 20 },
  { id: 148, name: 'سقز', slug: 'saqqez', province_id: 20 },
  { id: 149, name: 'بانه', slug: 'baneh', province_id: 20 },
  { id: 150, name: 'قروه', slug: 'qorveh', province_id: 20 },
  { id: 151, name: 'بیجار', slug: 'bijar', province_id: 20 },
  { id: 152, name: 'کامیاران', slug: 'kamyaran', province_id: 20 },

  // کرمان
  { id: 153, name: 'کرمان', slug: 'kerman', province_id: 21 },
  { id: 154, name: 'رفسنجان', slug: 'rafsanjan', province_id: 21 },
  { id: 155, name: 'سیرجان', slug: 'sirjan', province_id: 21 },
  { id: 156, name: 'جیرفت', slug: 'jiroft', province_id: 21 },
  { id: 157, name: 'بم', slug: 'bam', province_id: 21 },
  { id: 158, name: 'زرند', slug: 'zarand', province_id: 21 },
  { id: 159, name: 'شهربابک', slug: 'shahre-babak', province_id: 21 },
  { id: 160, name: 'بافت', slug: 'baft', province_id: 21 },
  { id: 161, name: 'کهنوج', slug: 'kahnooj', province_id: 21 },

  // کرمانشاه
  { id: 162, name: 'کرمانشاه', slug: 'kermanshah', province_id: 22 },
  { id: 163, name: 'اسلام‌آباد غرب', slug: 'eslamabad-gharb', province_id: 22 },
  { id: 164, name: 'سنقر', slug: 'songhor', province_id: 22 },
  { id: 165, name: 'هرسین', slug: 'harsin', province_id: 22 },
  { id: 166, name: 'کنگاور', slug: 'kangavar', province_id: 22 },
  { id: 167, name: 'صحنه', slug: 'sahneh', province_id: 22 },
  { id: 168, name: 'پاوه', slug: 'paveh', province_id: 22 },
  { id: 169, name: 'جوانرود', slug: 'javanrud', province_id: 22 },
  { id: 170, name: 'قصرشیرین', slug: 'qasr-shirin', province_id: 22 },

  // کهگیلویه و بویراحمد
  { id: 171, name: 'یاسوج', slug: 'yasuj', province_id: 23 },
  { id: 172, name: 'گچساران', slug: 'gachsaran', province_id: 23 },
  { id: 173, name: 'دهدشت', slug: 'dehdasht', province_id: 23 },
  { id: 174, name: 'دوگنبدان', slug: 'dogonbadan', province_id: 23 },

  // گلستان
  { id: 175, name: 'گرگان', slug: 'gorgan', province_id: 24 },
  { id: 176, name: 'گنبد کاووس', slug: 'gonbad-kavus', province_id: 24 },
  { id: 177, name: 'علی‌آباد', slug: 'aliabad', province_id: 24 },
  { id: 178, name: 'مینودشت', slug: 'minudasht', province_id: 24 },
  { id: 179, name: 'آق‌قلا', slug: 'aqqala', province_id: 24 },
  { id: 180, name: 'کردکوی', slug: 'kordkuy', province_id: 24 },
  { id: 181, name: 'بندر ترکمن', slug: 'bandar-torkaman', province_id: 24 },

  // گیلان
  { id: 182, name: 'رشت', slug: 'rasht', province_id: 25 },
  { id: 183, name: 'بندر انزلی', slug: 'bandar-anzali', province_id: 25 },
  { id: 184, name: 'لاهیجان', slug: 'lahijan', province_id: 25 },
  { id: 185, name: 'لنگرود', slug: 'langarud', province_id: 25 },
  { id: 186, name: 'رودسر', slug: 'rudsar', province_id: 25 },
  { id: 187, name: 'تالش', slug: 'talesh', province_id: 25 },
  { id: 188, name: 'آستارا', slug: 'astara', province_id: 25 },
  { id: 189, name: 'صومعه‌سرا', slug: 'someh-sara', province_id: 25 },
  { id: 190, name: 'فومن', slug: 'fuman', province_id: 25 },
  { id: 191, name: 'رودبار', slug: 'rudbar', province_id: 25 },

  // لرستان
  { id: 192, name: 'خرم‌آباد', slug: 'khorramabad', province_id: 26 },
  { id: 193, name: 'بروجرد', slug: 'borujerd', province_id: 26 },
  { id: 194, name: 'دورود', slug: 'dorud', province_id: 26 },
  { id: 195, name: 'الیگودرز', slug: 'aligudarz', province_id: 26 },
  { id: 196, name: 'ازنا', slug: 'azna', province_id: 26 },
  { id: 197, name: 'نورآباد', slug: 'nurabad', province_id: 26 },
  { id: 198, name: 'کوهدشت', slug: 'kuhdasht', province_id: 26 },
  { id: 199, name: 'الشتر', slug: 'aleshtar', province_id: 26 },

  // مازندران
  { id: 200, name: 'ساری', slug: 'sari', province_id: 27 },
  { id: 201, name: 'بابل', slug: 'babol', province_id: 27 },
  { id: 202, name: 'آمل', slug: 'amol', province_id: 27 },
  { id: 203, name: 'قائم‌شهر', slug: 'qaemshahr', province_id: 27 },
  { id: 204, name: 'بابلسر', slug: 'babolsar', province_id: 27 },
  { id: 205, name: 'تنکابن', slug: 'tonekabon', province_id: 27 },
  { id: 206, name: 'چالوس', slug: 'chalus', province_id: 27 },
  { id: 207, name: 'نوشهر', slug: 'nowshahr', province_id: 27 },
  { id: 208, name: 'رامسر', slug: 'ramsar', province_id: 27 },
  { id: 209, name: 'بهشهر', slug: 'behshahr', province_id: 27 },
  { id: 210, name: 'نکا', slug: 'neka', province_id: 27 },
  { id: 211, name: 'محمودآباد', slug: 'mahmudabad', province_id: 27 },

  // مرکزی
  { id: 212, name: 'اراک', slug: 'arak', province_id: 28 },
  { id: 213, name: 'ساوه', slug: 'saveh', province_id: 28 },
  { id: 214, name: 'خمین', slug: 'khomein', province_id: 28 },
  { id: 215, name: 'محلات', slug: 'mahalat', province_id: 28 },
  { id: 216, name: 'دلیجان', slug: 'delijan', province_id: 28 },
  { id: 217, name: 'تفرش', slug: 'tafresh', province_id: 28 },
  { id: 218, name: 'شازند', slug: 'shazand', province_id: 28 },

  // هرمزگان
  { id: 219, name: 'بندرعباس', slug: 'bandar-abbas', province_id: 29 },
  { id: 220, name: 'میناب', slug: 'minab', province_id: 29 },
  { id: 221, name: 'قشم', slug: 'qeshm', province_id: 29 },
  { id: 222, name: 'بندر لنگه', slug: 'bandar-lengeh', province_id: 29 },
  { id: 223, name: 'جاسک', slug: 'jask', province_id: 29 },
  { id: 224, name: 'کیش', slug: 'kish', province_id: 29 },
  { id: 225, name: 'حاجی‌آباد', slug: 'hajiabad', province_id: 29 },
  { id: 226, name: 'بستک', slug: 'bastak', province_id: 29 },

  // همدان
  { id: 227, name: 'همدان', slug: 'hamadan', province_id: 30 },
  { id: 228, name: 'ملایر', slug: 'malayer', province_id: 30 },
  { id: 229, name: 'نهاوند', slug: 'nahavand', province_id: 30 },
  { id: 230, name: 'تویسرکان', slug: 'tuyserkan', province_id: 30 },
  { id: 231, name: 'کبودرآهنگ', slug: 'kabudarahang', province_id: 30 },
  { id: 232, name: 'اسدآباد', slug: 'asadabad', province_id: 30 },
  { id: 233, name: 'رزن', slug: 'razan', province_id: 30 },

  // یزد
  { id: 234, name: 'یزد', slug: 'yazd', province_id: 31 },
  { id: 235, name: 'میبد', slug: 'meybod', province_id: 31 },
  { id: 236, name: 'اردکان', slug: 'ardakan', province_id: 31 },
  { id: 237, name: 'تفت', slug: 'taft', province_id: 31 },
  { id: 238, name: 'ابرکوه', slug: 'abarkuh', province_id: 31 },
  { id: 239, name: 'بافق', slug: 'bafq', province_id: 31 },
  { id: 240, name: 'مهریز', slug: 'mehriz', province_id: 31 },
];

// توابع کمکی
export const getProvinceById = (id: number): Province | undefined => {
  return provinces.find(p => p.id === id);
};

export const getCitiesByProvinceId = (provinceId: number): City[] => {
  return cities.filter(c => c.province_id === provinceId);
};

export const getCityById = (id: number): City | undefined => {
  return cities.find(c => c.id === id);
};

export const searchCities = (query: string): City[] => {
  const lowerQuery = query.toLowerCase();
  return cities.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) || 
    c.slug.includes(lowerQuery)
  );
};

export const searchProvinces = (query: string): Province[] => {
  const lowerQuery = query.toLowerCase();
  return provinces.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) || 
    p.slug.includes(lowerQuery)
  );
};

