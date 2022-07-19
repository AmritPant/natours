class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'feilds'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = JSON.parse(
            queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        );

        this.query = this.query.find(queryStr);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            this.query = this.query.sort(this.queryString.sort);
        } else {
            this.query = this.query.sort('-price');
        }
        return this;
    }

    limit() {
        if (this.queryString.fields) {
            this.query = this.query.select(this.queryString.fields);
        } else {
            this.query = this.query.select('-__V');
        }
        return this;
    }

    paginate() {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
