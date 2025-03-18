using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourBookingAPI.Data;
using TourBookingAPI.Model;

namespace TourBookingAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]/[Action]")]
    [ApiController]
    
    public class TourController : ControllerBase
    {
        private readonly TourRepositry _tourRepositry;

        public TourController(TourRepositry tourRepositry)
        {
            _tourRepositry = tourRepositry;
        }

        [HttpGet]
        public IActionResult GetTours()
        {
            var tours = _tourRepositry.SelectAll();
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public IActionResult GetTour(int id)
        {
            var tour = _tourRepositry.SelectById(id);
            if (tour == null || !tour.Any())
            {
                return NotFound();
            }
            return Ok(tour);
        }

      
        [HttpPost]
        public IActionResult Add(TourModel tourModel)
        {
            if (tourModel == null)
            {
                return BadRequest("Tour data is null");
            }

            var tour = _tourRepositry.Add(tourModel);
            if (!tour)
            {
                return BadRequest("Failed to add the tour");
            }

            return Ok(tour);
        }


        [HttpPut("{id}")]
        public IActionResult Update(int id,TourModel tourModel)
        {
            if (tourModel == null)
            {
                return BadRequest("Tour data is null");
            }

            tourModel.tour_Id = id;
            var isUpdated = _tourRepositry.Update(tourModel);
            if (!isUpdated)
            {
                return NotFound("Tour not found for updating");
            }

            return Ok("Tour updated successfully"); // You could also return NoContent if you prefer no body in response
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var isDeleted = _tourRepositry.Delete(id);
            if (!isDeleted)
            {
                return NotFound("Tour not found for deletion");
            }

            return Ok("Delete Success"); // 204 No Content is typical for successful DELETE operations
        }

        [HttpGet("search")]
        public ActionResult<IEnumerable<TourModel>> SearchTours(string title)
        {
            if (string.IsNullOrEmpty(title))
            {
                return BadRequest("Title parameter is required.");
            }

            var tours = _tourRepositry.SearchTours(title);
            return Ok(tours);
        }
    }
}
