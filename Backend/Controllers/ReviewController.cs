using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TourBookingAPI.Data;
using TourBookingAPI.Model;

namespace TourBookingAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly ReviewRepositry _reviewRepositry;

        public ReviewController(ReviewRepositry reviewRepositry)
        {
            _reviewRepositry = reviewRepositry;
           
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_reviewRepositry.SelectAll());
        }
        [HttpGet("id")]
        public IActionResult GetById(int id)
        {
            var review = _reviewRepositry.SelectByPK(id);
            if (review == null)
            {
                return NotFound();
            }
            return Ok(review);
        }
        
        [HttpGet("{tourId}")]
        public async Task<IActionResult> GetByTourId(int tourId)
        {
            try
            {
              

                var reviews = _reviewRepositry.GetReviewsByTourId(tourId);

             
                return Ok(reviews);
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, new { message = "Internal server error while fetching reviews" });
            }
        }



        [HttpPost]
        public IActionResult Add(ReviewModel reviewModel)
        {
            var review = _reviewRepositry.Add(reviewModel);
            if (review == null)
            {
                return BadRequest("data is null");
            }
            return Ok(reviewModel);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] ReviewModel reviewModel)
        {
            // Ensure the reviewModel contains the correct ID
            reviewModel.Review_Id = id; // Set the ID in the model
            var review = _reviewRepositry.Update(reviewModel);
            if (review == null)
            {
                return NotFound(); // Return 404 if the review does not exist
            }
            return Ok(review);
        }
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var review = _reviewRepositry.Delete(id);
            if (!review)
            {
                return NotFound();
            }
            return Ok("Delete Succesfully");

        }


    }
}
