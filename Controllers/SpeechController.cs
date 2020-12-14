using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpeechToText.Models;

namespace SpeechToText.Controllers
{
    public class SpeechController : Controller
    {
        public static Dictionary<int, string> dicTextLines = new Dictionary<int, string>();

        private static int index = 0;

        private static object lockObject = new object();

        private readonly ILogger<SpeechController> _logger;

        public SpeechController(ILogger<SpeechController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult History(int index)
        {
            SpeechJson model = null;
            if (index == 0)
            {
              model = new SpeechJson {
                index = dicTextLines.Any() ? dicTextLines.Max(x => x.Key) : 0,
                lines = dicTextLines.Select(x => x.Value).ToList()
              };
              
              return Json(model);
            }

            var textLines = dicTextLines.Where(x => x.Key > index);
            model = new SpeechJson {
              index = textLines.Any() ? textLines.Max(x => x.Key) : 0,
              lines = textLines.Select(x => x.Value).ToList()
            };

            return Json(model);
        }

        [HttpPost]
        public string Send(string send_text)
        {
          if(string.IsNullOrEmpty(send_text))
          {
            return "Empty";
          }

          lock(lockObject){
            index++;
            dicTextLines.Add(index, send_text);
          }
          return "OK";
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    public class SpeechJson
    {
      public int index { get; set; }
      public List<string> lines { get; set; }
    }
}
