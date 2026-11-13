using Microsoft.AspNetCore.Mvc;

namespace ExploradorContenido.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
